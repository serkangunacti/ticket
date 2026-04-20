import { randomBytes, randomUUID } from "node:crypto";

import { hash, compare } from "bcryptjs";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { ensureDatabaseReady, getDb } from "@/lib/db";
import { env, hasAdminCredentials, hasDatabase } from "@/lib/env";
import { readInboxMessages, sendSystemMail, sendTicketReply } from "@/lib/mail";
import { loadMockStore, saveMockStore } from "@/lib/mock-store";
import { buildExcelWorkbook, buildPdfBuffer, calculateMetrics } from "@/lib/reports";
import {
  adminUsers,
  attachments,
  auditLogs,
  customers,
  mailThreads,
  monthlyReports,
  supportAgents,
  tenantDomains,
  tenants,
  ticketMessages,
  tickets,
} from "@/lib/schema";
import { collectThreadCandidates } from "@/lib/threading";
import type {
  AuditLogRecord,
  CustomerRecord,
  InboundMail,
  SupportAgentRecord,
  SupportRole,
  TenantRecord,
  TicketDetail,
  TicketFilters,
  TicketListItem,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";
import { createTicketCode, getEmailDomain, slugify } from "@/lib/utils";

function now() {
  return new Date();
}

function createInviteToken() {
  return randomBytes(24).toString("hex");
}

const LEGACY_BOOTSTRAP_ADMIN_EMAILS = ["admin@uptexx.com"];

function getLegacyBootstrapAdminEmails() {
  return LEGACY_BOOTSTRAP_ADMIN_EMAILS.filter((email) => email !== env.ADMIN_EMAIL);
}

async function sendSupportInvite(input: {
  to: string;
  name: string;
  role: SupportRole;
  inviteBaseUrl: string;
  token: string;
}) {
  const baseUrl = input.inviteBaseUrl.replace(/\/$/, "");
  const activationUrl = `${baseUrl}/ticket/activate?token=${input.token}`;

  await sendSystemMail({
    to: input.to,
    subject: "Uptexx Ticket panel daveti",
    bodyText: [
      `Merhaba ${input.name},`,
      "",
      "Uptexx Ticket paneline davet edildiniz.",
      `Rolünüz: ${input.role}`,
      "",
      "İlk girişiniz için aşağıdaki bağlantıyı açıp kendi şifrenizi belirleyin:",
      activationUrl,
      "",
      "Bağlantı 7 gün boyunca geçerlidir.",
    ].join("\n"),
  });
}

function getUnassignedTenant(store: Awaited<ReturnType<typeof loadMockStore>>) {
  let tenant = store.tenants.find((item) => item.slug === "unassigned");
  if (!tenant) {
    tenant = {
      id: randomUUID(),
      name: "Unassigned",
      slug: "unassigned",
      supportAddress: env.M365_SHARED_MAILBOX,
      domains: [],
      isActive: true,
      deactivatedAt: null,
      createdAt: now(),
    };
    store.tenants.push(tenant);
  }
  return tenant;
}

async function ensureDbAdminUser() {
  if (!hasDatabase || !hasAdminCredentials) return null;

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  const legacyEmails = getLegacyBootstrapAdminEmails();
  if (legacyEmails.length) {
    await db.delete(adminUsers).where(inArray(adminUsers.email, legacyEmails));
  }

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, env.ADMIN_EMAIL!))
    .limit(1);

  if (existing[0]) {
    const passwordHash = await hash(env.ADMIN_PASSWORD!, 10);

    await db
      .update(adminUsers)
      .set({
        passwordHash,
        updatedAt: now(),
      })
      .where(eq(adminUsers.id, existing[0].id));

    return {
      ...existing[0],
      passwordHash,
      updatedAt: now(),
    };
  }

  const admin = {
    id: randomUUID(),
    email: env.ADMIN_EMAIL!,
    name: "Uptexx Admin",
    passwordHash: await hash(env.ADMIN_PASSWORD!, 10),
    createdAt: now(),
    updatedAt: now(),
  };

  await db.insert(adminUsers).values(admin);
  return admin;
}

async function ensureDefaultSupportAgent() {
  if (!hasAdminCredentials) return null;

  const legacyEmails = getLegacyBootstrapAdminEmails();

  if (!hasDatabase) {
    const store = await loadMockStore();
    if (legacyEmails.length) {
      const legacyIds = store.supportAgents
        .filter((item) => legacyEmails.includes(item.email))
        .map((item) => item.id);

      if (legacyIds.length) {
        store.supportAgents = store.supportAgents.filter(
          (item) => !legacyEmails.includes(item.email),
        );
        store.tickets = store.tickets.map((ticket) =>
          ticket.assigneeId && legacyIds.includes(ticket.assigneeId)
            ? {
                ...ticket,
                assigneeId: null,
                assigneeName: null,
              }
            : ticket,
        );
      }
    }

    let agent = store.supportAgents.find((item) => item.email === env.ADMIN_EMAIL);
    if (!agent) {
      agent = {
        id: randomUUID(),
        name: "Uptexx Admin",
        email: env.ADMIN_EMAIL!,
        role: "owner",
        isActive: true,
        invitePending: false,
        createdAt: now(),
        deactivatedAt: null,
      };
      store.supportAgents.push(agent);
    } else {
      agent.role = "owner";
      agent.isActive = true;
      agent.invitePending = false;
    }
    if (
      !store.tickets.some((ticket) => ticket.assigneeId === agent.id) &&
      store.tickets[0] &&
      !store.tickets[0].assigneeId
    ) {
      store.tickets[0].assigneeId = agent.id;
      store.tickets[0].assigneeName = agent.name;
    }
    await saveMockStore(store);
    return agent;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  if (legacyEmails.length) {
    const legacyAgents = await db
      .select({ id: supportAgents.id })
      .from(supportAgents)
      .where(inArray(supportAgents.email, legacyEmails));

    const legacyIds = legacyAgents.map((agent) => agent.id);
    if (legacyIds.length) {
      await db
        .update(tickets)
        .set({ assigneeId: null, updatedAt: now() })
        .where(inArray(tickets.assigneeId, legacyIds));

      await db.delete(supportAgents).where(inArray(supportAgents.email, legacyEmails));
    }
  }

  const existing = await db
    .select()
    .from(supportAgents)
    .where(eq(supportAgents.email, env.ADMIN_EMAIL!))
    .limit(1);

  const createdAt = now();

  if (existing[0]) {
    const passwordHash = await hash(env.ADMIN_PASSWORD!, 10);
    await db
      .update(supportAgents)
      .set({
        role: "owner",
        isActive: true,
        passwordHash,
        inviteToken: null,
        inviteExpiresAt: null,
        invitedAt: existing[0].invitedAt ?? createdAt,
        updatedAt: createdAt,
      })
      .where(eq(supportAgents.id, existing[0].id));

    return {
      ...existing[0],
      role: "owner",
      isActive: true,
      passwordHash,
      inviteToken: null,
      inviteExpiresAt: null,
      invitedAt: existing[0].invitedAt ?? createdAt,
      updatedAt: createdAt,
    };
  }

  const agent = {
    id: randomUUID(),
    name: "Uptexx Admin",
    email: env.ADMIN_EMAIL!,
    role: "owner" as const,
    passwordHash: await hash(env.ADMIN_PASSWORD!, 10),
    inviteToken: null,
    inviteExpiresAt: null,
    invitedAt: createdAt,
    isActive: true,
    createdAt,
    deactivatedAt: null,
    updatedAt: createdAt,
  };

  await db.insert(supportAgents).values(agent);
  return agent;
}

export async function verifyAdminLogin(email: string, password: string) {
  if (!hasAdminCredentials) return null;

  await ensureDbAdminUser();
  await ensureDefaultSupportAgent();

  if (!hasDatabase) {
    const store = await loadMockStore();
    const agent = store.supportAgents.find(
      (item) => item.email === email && item.isActive,
    );
    if (!agent) return null;

    if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
      return {
        userId: agent.id,
        email: agent.email,
        name: agent.name,
        role: agent.role,
      };
    }

    return null;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(supportAgents)
    .where(eq(supportAgents.email, email))
    .limit(1);

  const agent = result[0];
  if (!agent || !agent.isActive || !agent.passwordHash) return null;

  const valid = await compare(password, agent.passwordHash);
  if (!valid) return null;

  return {
    userId: agent.id,
    email: agent.email,
    name: agent.name,
    role: agent.role,
  };
}

export async function recordAudit(input: {
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  meta?: Record<string, unknown>;
}) {
  if (!hasDatabase) {
    const store = await loadMockStore();
    store.auditLogs.unshift({
      id: randomUUID(),
      adminEmail: input.adminEmail,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      createdAt: now(),
    });
    await saveMockStore(store);
    return;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return;

  await db.insert(auditLogs).values({
    id: randomUUID(),
    adminEmail: input.adminEmail,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    meta: input.meta ?? null,
    createdAt: now(),
  });
}

export async function listAuditLogs(limit = 8): Promise<AuditLogRecord[]> {
  if (!hasDatabase) {
    const store = await loadMockStore();
    return [...store.auditLogs]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, limit);
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return rows.map((entry) => ({
    id: entry.id,
    adminEmail: entry.adminEmail,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    summary: entry.summary,
    createdAt: entry.createdAt,
    meta: (entry.meta as Record<string, unknown> | null | undefined) ?? null,
  }));
}

export async function listTenants(): Promise<TenantRecord[]> {
  if (!hasDatabase) {
    const store = await loadMockStore();
    return [...store.tenants].sort((a, b) => a.name.localeCompare(b.name));
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return [];

  const [tenantRows, domainRows] = await Promise.all([
    db.select().from(tenants).orderBy(asc(tenants.name)),
    db.select().from(tenantDomains),
  ]);

  return tenantRows.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    supportAddress: tenant.supportAddress,
    isActive: tenant.isActive,
    deactivatedAt: tenant.deactivatedAt,
    createdAt: tenant.createdAt,
    domains: domainRows
      .filter((domain) => domain.tenantId === tenant.id)
      .map((domain) => domain.domain),
  }));
}

export async function createTenant(input: {
  name: string;
  supportAddress: string;
  domains: string[];
  adminEmail: string;
}) {
  const tenantId = randomUUID();
  const tenant: TenantRecord = {
    id: tenantId,
    name: input.name.trim(),
    slug: slugify(input.name),
    supportAddress: input.supportAddress.trim(),
    domains: input.domains.map((domain: string) => domain.toLowerCase()),
    isActive: true,
    deactivatedAt: null,
    createdAt: now(),
  };

  if (!hasDatabase) {
    const store = await loadMockStore();
    store.tenants.push(tenant);
    await saveMockStore(store);
    await recordAudit({
      adminEmail: input.adminEmail,
      action: "tenant.create",
      entityType: "tenant",
      entityId: tenant.id,
      summary: `Created tenant ${tenant.name}`,
    });
    return tenant;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return tenant;

  await db.insert(tenants).values({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    supportAddress: tenant.supportAddress,
    isActive: tenant.isActive,
    deactivatedAt: tenant.deactivatedAt,
    createdAt: tenant.createdAt,
    updatedAt: tenant.createdAt,
  });

  if (tenant.domains.length) {
    await db.insert(tenantDomains).values(
      tenant.domains.map((domain: string) => ({
        id: randomUUID(),
        tenantId: tenant.id,
        domain,
        createdAt: tenant.createdAt,
      })),
    );
  }

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "tenant.create",
    entityType: "tenant",
    entityId: tenant.id,
    summary: `Created tenant ${tenant.name}`,
  });

  return tenant;
}

export async function setTenantActiveState(input: {
  tenantId: string;
  isActive: boolean;
  adminEmail: string;
}) {
  if (!hasDatabase) {
    const store = await loadMockStore();
    const tenant = store.tenants.find((item) => item.id === input.tenantId);
    if (!tenant) return null;
    tenant.isActive = input.isActive;
    tenant.deactivatedAt = input.isActive ? null : now();
    for (const ticket of store.tickets) {
      if (ticket.tenantId === tenant.id) {
        ticket.tenantIsActive = input.isActive;
      }
    }
    await saveMockStore(store);
    await recordAudit({
      adminEmail: input.adminEmail,
      action: "tenant.state",
      entityType: "tenant",
      entityId: tenant.id,
      summary: `${tenant.name} ${input.isActive ? "activated" : "deactivated"}`,
    });
    return tenant;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return null;

  await db
    .update(tenants)
    .set({
      isActive: input.isActive,
      deactivatedAt: input.isActive ? null : now(),
      updatedAt: now(),
    })
    .where(eq(tenants.id, input.tenantId));

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "tenant.state",
    entityType: "tenant",
    entityId: input.tenantId,
    summary: `Updated tenant activity ${input.tenantId}`,
  });

  const allTenants = await listTenants();
  return allTenants.find((item) => item.id === input.tenantId) ?? null;
}

export async function updateTenant(input: {
  tenantId: string;
  name: string;
  supportAddress: string;
  domains: string[];
  isActive: boolean;
  adminEmail: string;
}) {
  const nextName = input.name.trim();
  const nextSupportAddress = input.supportAddress.trim();
  const nextDomains = input.domains.map((domain) => domain.toLowerCase());

  if (!hasDatabase) {
    const store = await loadMockStore();
    const tenant = store.tenants.find((item) => item.id === input.tenantId);
    if (!tenant) return null;
    tenant.name = nextName;
    tenant.slug = slugify(nextName);
    tenant.supportAddress = nextSupportAddress;
    tenant.domains = nextDomains;
    tenant.isActive = input.isActive;
    tenant.deactivatedAt = input.isActive ? null : now();
    for (const customer of store.customers) {
      if (customer.tenantId === tenant.id) {
        customer.companyName = nextName;
      }
    }
    for (const ticket of store.tickets) {
      if (ticket.tenantId === tenant.id) {
        ticket.tenantName = nextName;
        ticket.tenantDomains = nextDomains;
        ticket.tenantIsActive = input.isActive;
      }
    }
    await saveMockStore(store);
    return tenant;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return null;

  await db
    .update(tenants)
    .set({
      name: nextName,
      slug: slugify(nextName),
      supportAddress: nextSupportAddress,
      isActive: input.isActive,
      deactivatedAt: input.isActive ? null : now(),
      updatedAt: now(),
    })
    .where(eq(tenants.id, input.tenantId));

  await db.delete(tenantDomains).where(eq(tenantDomains.tenantId, input.tenantId));
  if (nextDomains.length) {
    await db.insert(tenantDomains).values(
      nextDomains.map((domain) => ({
        id: randomUUID(),
        tenantId: input.tenantId,
        domain,
        createdAt: now(),
      })),
    );
  }

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "tenant.update",
    entityType: "tenant",
    entityId: input.tenantId,
    summary: `Updated tenant ${nextName}`,
  });

  const allTenants = await listTenants();
  return allTenants.find((item) => item.id === input.tenantId) ?? null;
}

export async function getTenant(tenantId: string) {
  const allTenants = await listTenants();
  return allTenants.find((item) => item.id === tenantId) ?? null;
}

export async function listSupportAgents(): Promise<SupportAgentRecord[]> {
  await ensureDefaultSupportAgent();

  if (!hasDatabase) {
    const store = await loadMockStore();
    return [...store.supportAgents].sort((a, b) => a.name.localeCompare(b.name));
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return [];

  const rows = await db.select().from(supportAgents).orderBy(asc(supportAgents.name));
  return rows.map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    isActive: agent.isActive,
    invitePending: Boolean(agent.inviteToken && !agent.passwordHash),
    createdAt: agent.createdAt,
    deactivatedAt: agent.deactivatedAt,
  }));
}

export async function createSupportAgent(input: {
  name: string;
  email: string;
  role: SupportRole;
  inviteBaseUrl: string;
  adminEmail: string;
}) {
  const createdAt = now();
  const inviteToken = createInviteToken();
  const inviteExpiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 7);
  const agent: SupportAgentRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isActive: true,
    invitePending: true,
    createdAt,
    deactivatedAt: null,
  };

  if (!hasDatabase) {
    const store = await loadMockStore();
    store.supportAgents.push(agent);
    await saveMockStore(store);
    await sendSupportInvite({
      to: agent.email,
      name: agent.name,
      role: agent.role,
      inviteBaseUrl: input.inviteBaseUrl,
      token: inviteToken,
    });
    await recordAudit({
      adminEmail: input.adminEmail,
      action: "agent.create",
      entityType: "support_agent",
      entityId: agent.id,
      summary: `Created support agent ${agent.name}`,
    });
    return agent;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return agent;

  await db.insert(supportAgents).values({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: input.role,
    passwordHash: null,
    inviteToken,
    inviteExpiresAt,
    invitedAt: createdAt,
    isActive: true,
    createdAt,
    deactivatedAt: null,
    updatedAt: createdAt,
  });

  await sendSupportInvite({
    to: agent.email,
    name: agent.name,
    role: agent.role,
    inviteBaseUrl: input.inviteBaseUrl,
    token: inviteToken,
  });

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "agent.create",
    entityType: "support_agent",
    entityId: agent.id,
    summary: `Created support agent ${agent.name}`,
  });

  return agent;
}

export async function setSupportAgentActiveState(input: {
  agentId: string;
  isActive: boolean;
  adminEmail: string;
}) {
  if (!hasDatabase) {
    const store = await loadMockStore();
    const agent = store.supportAgents.find((item) => item.id === input.agentId);
    if (!agent) return null;
    agent.isActive = input.isActive;
    agent.deactivatedAt = input.isActive ? null : now();
    await saveMockStore(store);
    await recordAudit({
      adminEmail: input.adminEmail,
      action: "agent.state",
      entityType: "support_agent",
      entityId: agent.id,
      summary: `${agent.name} ${input.isActive ? "activated" : "deactivated"}`,
    });
    return agent;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return null;

  await db
    .update(supportAgents)
    .set({
      isActive: input.isActive,
      deactivatedAt: input.isActive ? null : now(),
      updatedAt: now(),
    })
    .where(eq(supportAgents.id, input.agentId));

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "agent.state",
    entityType: "support_agent",
    entityId: input.agentId,
    summary: `Updated support agent activity ${input.agentId}`,
  });

  const agents = await listSupportAgents();
  return agents.find((item) => item.id === input.agentId) ?? null;
}

export async function updateSupportAgent(input: {
  agentId: string;
  name: string;
  role: SupportRole;
  isActive: boolean;
  adminEmail: string;
}) {
  if (!hasDatabase) {
    const store = await loadMockStore();
    const agent = store.supportAgents.find((item) => item.id === input.agentId);
    if (!agent) return null;
    agent.name = input.name.trim();
    agent.role = input.role;
    agent.isActive = input.isActive;
    agent.deactivatedAt = input.isActive ? null : now();
    for (const ticket of store.tickets) {
      if (ticket.assigneeId === agent.id) {
        ticket.assigneeName = agent.name;
      }
    }
    await saveMockStore(store);
    return agent;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return null;

  await db
    .update(supportAgents)
    .set({
      name: input.name.trim(),
      role: input.role,
      isActive: input.isActive,
      deactivatedAt: input.isActive ? null : now(),
      updatedAt: now(),
    })
    .where(eq(supportAgents.id, input.agentId));

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "agent.update",
    entityType: "support_agent",
    entityId: input.agentId,
    summary: `Updated support agent ${input.agentId}`,
  });

  const agents = await listSupportAgents();
  return agents.find((item) => item.id === input.agentId) ?? null;
}

export async function getSupportAgent(agentId: string) {
  await ensureDefaultSupportAgent();

  if (!hasDatabase) {
    const store = await loadMockStore();
    return store.supportAgents.find((item) => item.id === agentId) ?? null;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(supportAgents)
    .where(eq(supportAgents.id, agentId))
    .limit(1);

  const agent = rows[0];
  if (!agent) return null;

  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    isActive: agent.isActive,
    invitePending: Boolean(agent.inviteToken && !agent.passwordHash),
    createdAt: agent.createdAt,
    deactivatedAt: agent.deactivatedAt,
  } satisfies SupportAgentRecord;
}

export async function getSupportAgentByInviteToken(token: string) {
  if (!token) return null;

  await ensureDefaultSupportAgent();

  if (!hasDatabase) {
    return null;
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(supportAgents)
    .where(eq(supportAgents.inviteToken, token))
    .limit(1);

  const agent = rows[0];
  if (!agent) return null;
  if (!agent.inviteExpiresAt || agent.inviteExpiresAt.getTime() < now().getTime()) {
    return null;
  }

  return agent;
}

export async function activateSupportAgent(input: {
  token: string;
  password: string;
}) {
  const agent = await getSupportAgentByInviteToken(input.token);
  if (!agent) return null;

  const passwordHash = await hash(input.password, 10);

  const db = getDb();
  if (!db) return null;

  await db
    .update(supportAgents)
    .set({
      passwordHash,
      inviteToken: null,
      inviteExpiresAt: null,
      invitedAt: agent.invitedAt ?? now(),
      updatedAt: now(),
    })
    .where(eq(supportAgents.id, agent.id));

  return {
    userId: agent.id,
    email: agent.email,
    name: agent.name,
    role: agent.role,
  };
}

export async function changeSupportAgentPassword(input: {
  agentId: string;
  currentPassword: string;
  nextPassword: string;
}) {
  if (!hasDatabase) {
    if (
      input.agentId &&
      env.ADMIN_EMAIL &&
      input.currentPassword === env.ADMIN_PASSWORD &&
      env.ADMIN_PASSWORD
    ) {
      return { success: true };
    }
    return { success: false };
  }

  await ensureDatabaseReady();
  const db = getDb();
  if (!db) return { success: false };

  const rows = await db
    .select()
    .from(supportAgents)
    .where(eq(supportAgents.id, input.agentId))
    .limit(1);

  const agent = rows[0];
  if (!agent?.passwordHash) return { success: false };

  const valid = await compare(input.currentPassword, agent.passwordHash);
  if (!valid) return { success: false };

  await db
    .update(supportAgents)
    .set({
      passwordHash: await hash(input.nextPassword, 10),
      updatedAt: now(),
    })
    .where(eq(supportAgents.id, input.agentId));

  return { success: true };
}

function applyFiltersToMockTickets(filters: TicketFilters) {
  return loadMockStore().then((store) =>
    store.tickets
    .filter((ticket) => {
      if (filters.tenantId && ticket.tenantId !== filters.tenantId) return false;
      if (filters.status && filters.status !== "all" && ticket.status !== filters.status)
        return false;
      if (
        filters.priority &&
        filters.priority !== "all" &&
        ticket.priority !== filters.priority
      )
        return false;
      if (filters.query) {
        const haystack = `${ticket.ticketCode} ${ticket.subject} ${ticket.customerEmail} ${ticket.tenantName}`.toLowerCase();
        if (!haystack.includes(filters.query.toLowerCase())) return false;
      }
      if (filters.from && ticket.firstReceivedAt < new Date(filters.from)) return false;
      if (filters.to && ticket.firstReceivedAt > new Date(filters.to)) return false;
      return true;
    })
    .sort((a, b) => b.firstReceivedAt.getTime() - a.firstReceivedAt.getTime()),
  );
}

export async function listTickets(filters: TicketFilters): Promise<TicketListItem[]> {
  if (!hasDatabase) {
    return applyFiltersToMockTickets(filters);
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return [];

  const conditions = [];
  if (filters.tenantId) conditions.push(eq(tickets.tenantId, filters.tenantId));
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(tickets.status, filters.status));
  }
  if (filters.priority && filters.priority !== "all") {
    conditions.push(eq(tickets.priority, filters.priority));
  }
  if (filters.from) conditions.push(gte(tickets.firstReceivedAt, new Date(filters.from)));
  if (filters.to) conditions.push(lte(tickets.firstReceivedAt, new Date(filters.to)));
  if (filters.query) {
    const pattern = `%${filters.query}%`;
    conditions.push(
      or(
        like(tickets.ticketCode, pattern),
        like(tickets.subject, pattern),
        like(customers.email, pattern),
        like(tenants.name, pattern),
      )!,
    );
  }

  const rows = await db
    .select({
      id: tickets.id,
      ticketCode: tickets.ticketCode,
      tenantId: tickets.tenantId,
      tenantName: tenants.name,
      tenantIsActive: tenants.isActive,
      customerId: tickets.customerId,
      customerEmail: customers.email,
      customerName: customers.name,
      assigneeId: tickets.assigneeId,
      assigneeName: supportAgents.name,
      subject: tickets.subject,
      description: tickets.description,
      status: tickets.status,
      priority: tickets.priority,
      sourceChannel: tickets.sourceChannel,
      firstReceivedAt: tickets.firstReceivedAt,
      firstResponseAt: tickets.firstResponseAt,
      resolvedAt: tickets.resolvedAt,
      resolutionNote: tickets.resolutionNote,
      lastActivityAt: tickets.lastActivityAt,
      createdAt: tickets.createdAt,
    })
    .from(tickets)
    .innerJoin(customers, eq(customers.id, tickets.customerId))
    .innerJoin(tenants, eq(tenants.id, tickets.tenantId))
    .leftJoin(supportAgents, eq(supportAgents.id, tickets.assigneeId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(tickets.firstReceivedAt));

  return rows;
}

export async function getTicketDetail(ticketId: string): Promise<TicketDetail | null> {
  if (!hasDatabase) {
    const store = await loadMockStore();
    return store.tickets.find((ticket) => ticket.id === ticketId) ?? null;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  const [ticketRows, domainRows, messageRows] = await Promise.all([
    db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        tenantId: tickets.tenantId,
        tenantName: tenants.name,
        tenantIsActive: tenants.isActive,
        customerId: tickets.customerId,
        customerEmail: customers.email,
        customerName: customers.name,
        assigneeId: tickets.assigneeId,
        assigneeName: supportAgents.name,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        sourceChannel: tickets.sourceChannel,
        firstReceivedAt: tickets.firstReceivedAt,
        firstResponseAt: tickets.firstResponseAt,
        resolvedAt: tickets.resolvedAt,
        resolutionNote: tickets.resolutionNote,
        lastActivityAt: tickets.lastActivityAt,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .innerJoin(customers, eq(customers.id, tickets.customerId))
      .innerJoin(tenants, eq(tenants.id, tickets.tenantId))
      .leftJoin(supportAgents, eq(supportAgents.id, tickets.assigneeId))
      .where(eq(tickets.id, ticketId))
      .limit(1),
    db.select().from(tenantDomains),
    db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(asc(ticketMessages.createdAt)),
  ]);

  const ticket = ticketRows[0];
  if (!ticket) return null;

  const messageIds = messageRows.map((message) => message.id);
  const attachmentRows = messageIds.length
    ? await db
        .select()
        .from(attachments)
        .where(inArray(attachments.messageId, messageIds))
    : [];

  return {
    ...ticket,
    tenantDomains: domainRows
      .filter((domain) => domain.tenantId === ticket.tenantId)
      .map((domain) => domain.domain),
    messages: messageRows.map((message) => ({
      id: message.id,
      ticketId: message.ticketId,
      authorType: message.authorType,
      direction: message.direction,
      sourceMessageId: message.sourceMessageId,
      subject: message.subject,
      bodyText: message.bodyText,
      bodyHtml: message.bodyHtml,
      sentAt: message.sentAt,
      createdAt: message.createdAt,
      attachments: attachmentRows
        .filter((attachment) => attachment.messageId === message.id)
        .map((attachment) => ({
          id: attachment.id,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          storagePath: attachment.storagePath,
        })),
    })),
  };
}

async function findTenantForEmail(email: string) {
  const domain = getEmailDomain(email);

  if (!hasDatabase) {
    const store = await loadMockStore();
    const tenant =
      store.tenants.find((tenant) => tenant.domains.includes(domain)) ??
      getUnassignedTenant(store);
    await saveMockStore(store);
    return tenant;
  }

  const db = getDb();
  if (!db) return null;

  const domainRows = await db
    .select()
    .from(tenantDomains)
    .where(eq(tenantDomains.domain, domain))
    .limit(1);

  if (domainRows[0]) {
    const tenantRows = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, domainRows[0].tenantId))
      .limit(1);

    if (tenantRows[0]) {
      return {
        id: tenantRows[0].id,
        name: tenantRows[0].name,
        slug: tenantRows[0].slug,
        supportAddress: tenantRows[0].supportAddress,
        domains: [domain],
        isActive: tenantRows[0].isActive,
        deactivatedAt: tenantRows[0].deactivatedAt,
        createdAt: tenantRows[0].createdAt,
      } satisfies TenantRecord;
    }
  }

  const fallbackRows = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, "unassigned"))
    .limit(1);

  if (fallbackRows[0]) {
    return {
      id: fallbackRows[0].id,
      name: fallbackRows[0].name,
      slug: fallbackRows[0].slug,
      supportAddress: fallbackRows[0].supportAddress,
      domains: [],
      isActive: fallbackRows[0].isActive,
      deactivatedAt: fallbackRows[0].deactivatedAt,
      createdAt: fallbackRows[0].createdAt,
    };
  }

  const createdAt = now();
  const tenantId = randomUUID();
  await db.insert(tenants).values({
    id: tenantId,
    name: "Unassigned",
    slug: "unassigned",
    supportAddress: env.M365_SHARED_MAILBOX,
    isActive: true,
    deactivatedAt: null,
    createdAt,
    updatedAt: createdAt,
  });

  return {
    id: tenantId,
    name: "Unassigned",
    slug: "unassigned",
    supportAddress: env.M365_SHARED_MAILBOX,
    domains: [],
    isActive: true,
    deactivatedAt: null,
    createdAt,
  };
}

async function ensureCustomerRecord(tenant: TenantRecord, inbound: InboundMail) {
  const customerName = inbound.fromName?.trim() || inbound.fromEmail.split("@")[0];

  if (!hasDatabase) {
    const store = await loadMockStore();
    let customer = store.customers.find(
      (item) => item.tenantId === tenant.id && item.email === inbound.fromEmail,
    );
    if (!customer) {
      customer = {
        id: randomUUID(),
        tenantId: tenant.id,
        email: inbound.fromEmail,
        name: customerName,
        companyName: tenant.name,
      };
      store.customers.push(customer);
      await saveMockStore(store);
    }
    return customer;
  }

  const db = getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(customers)
    .where(and(eq(customers.tenantId, tenant.id), eq(customers.email, inbound.fromEmail)))
    .limit(1);

  if (existing[0]) {
    return {
      id: existing[0].id,
      tenantId: existing[0].tenantId,
      email: existing[0].email,
      name: existing[0].name,
      companyName: existing[0].companyName,
    } satisfies CustomerRecord;
  }

  const customer = {
    id: randomUUID(),
    tenantId: tenant.id,
    email: inbound.fromEmail,
    name: customerName,
    companyName: tenant.name,
    createdAt: now(),
    updatedAt: now(),
  };

  await db.insert(customers).values(customer);
  return {
    id: customer.id,
    tenantId: customer.tenantId,
    email: customer.email,
    name: customer.name,
    companyName: customer.companyName,
  };
}

async function findExistingTicketForInboundMail(mail: InboundMail): Promise<string | null> {
  const thread = collectThreadCandidates({
    inReplyTo: mail.inReplyTo,
    references: mail.references,
    subject: mail.subject,
  });

  if (!hasDatabase) {
    const store = await loadMockStore();
    for (const ticket of store.tickets) {
      const sourceMessageIds = ticket.messages
        .map((message) => message.sourceMessageId)
        .filter(Boolean) as string[];
      if (
        thread.messageIds.some((messageId) => sourceMessageIds.includes(messageId)) ||
        thread.ticketCode === ticket.ticketCode
      ) {
        return ticket.id;
      }
    }
    return null;
  }

  const db = getDb();
  if (!db) return null;

  if (thread.messageIds.length) {
    const threadRows = await db
      .select()
      .from(mailThreads)
      .where(inArray(mailThreads.messageId, thread.messageIds))
      .limit(1);

    if (threadRows[0]) return threadRows[0].ticketId;
  }

  if (thread.ticketCode) {
    const ticketRows = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.ticketCode, thread.ticketCode))
      .limit(1);

    if (ticketRows[0]) return ticketRows[0].id;
  }

  return null;
}

async function getNextSequenceNo() {
  if (!hasDatabase) {
    const store = await loadMockStore();
    const current = store.tickets.reduce((max, ticket) => {
      const match = ticket.ticketCode.match(/(\d+)$/);
      return Math.max(max, Number(match?.[1] ?? 0));
    }, 1000);
    return current + 1;
  }

  const db = getDb();
  if (!db) return 1001;

  const result = await db
    .select({ maxSeq: sql<number>`coalesce(max(${tickets.sequenceNo}), 1000)` })
    .from(tickets);

  return Number(result[0]?.maxSeq ?? 1000) + 1;
}

function buildAttachmentStoragePath(messageId: string, fileName: string) {
  return `uploads/${messageId}/${fileName}`;
}

export async function ingestInboundMail(mail: InboundMail) {
  const existingTicketId = await findExistingTicketForInboundMail(mail);

  if (!hasDatabase) {
    const store = await loadMockStore();
    if (existingTicketId) {
      const ticket = store.tickets.find((item) => item.id === existingTicketId);
      if (!ticket) return null;

      if (ticket.messages.some((message) => message.sourceMessageId === mail.messageId)) {
        return ticket;
      }

      ticket.messages.push({
        id: randomUUID(),
        ticketId: ticket.id,
        authorType: "customer",
        direction: "inbound",
        sourceMessageId: mail.messageId,
        subject: mail.subject,
        bodyText: mail.text,
        bodyHtml: mail.html,
        createdAt: mail.receivedAt,
        sentAt: mail.receivedAt,
        attachments: mail.attachments.map((attachment) => ({
          id: randomUUID(),
          fileName: attachment.fileName,
          mimeType: attachment.mimeType ?? null,
          sizeBytes: attachment.sizeBytes,
          storagePath: buildAttachmentStoragePath(ticket.id, attachment.fileName),
        })),
      });
      ticket.lastActivityAt = mail.receivedAt;
      ticket.status = "open";
      await saveMockStore(store);
      return ticket;
    }

    const tenant = await findTenantForEmail(mail.fromEmail);
    const customer = await ensureCustomerRecord(tenant!, mail);
    const sequenceNo = await getNextSequenceNo();
    const createdAt = mail.receivedAt;
    const ticketId = randomUUID();

    const ticket: TicketDetail = {
      id: ticketId,
      ticketCode: createTicketCode(sequenceNo),
      tenantId: tenant!.id,
      tenantName: tenant!.name,
      tenantIsActive: tenant!.isActive,
      tenantDomains: tenant!.domains,
      customerId: customer!.id,
      customerEmail: customer!.email,
      customerName: customer!.name,
      assigneeId: null,
      assigneeName: null,
      subject: mail.subject,
      description: mail.text,
      status: "new",
      priority: "normal",
      sourceChannel: "email",
      firstReceivedAt: createdAt,
      firstResponseAt: null,
      resolvedAt: null,
      resolutionNote: null,
      lastActivityAt: createdAt,
      createdAt,
      messages: [
        {
          id: randomUUID(),
          ticketId,
          authorType: "customer",
          direction: "inbound",
          sourceMessageId: mail.messageId,
          subject: mail.subject,
          bodyText: mail.text,
          bodyHtml: mail.html,
          sentAt: createdAt,
          createdAt,
          attachments: mail.attachments.map((attachment) => ({
            id: randomUUID(),
            fileName: attachment.fileName,
            mimeType: attachment.mimeType ?? null,
            sizeBytes: attachment.sizeBytes,
            storagePath: buildAttachmentStoragePath(ticketId, attachment.fileName),
          })),
        },
      ],
    };
    store.tickets.unshift(ticket);
    await saveMockStore(store);
    return ticket;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  const existingMessage = await db
    .select()
    .from(ticketMessages)
    .where(eq(ticketMessages.sourceMessageId, mail.messageId))
    .limit(1);

  if (existingMessage[0]) {
    return getTicketDetail(existingMessage[0].ticketId);
  }

  if (existingTicketId) {
    const messageId = randomUUID();
    await db.insert(ticketMessages).values({
      id: messageId,
      ticketId: existingTicketId,
      authorType: "customer",
      direction: "inbound",
      sourceMessageId: mail.messageId,
      inReplyTo: mail.inReplyTo ?? null,
      referencesHeader: mail.references?.join(" ") ?? null,
      subject: mail.subject,
      bodyText: mail.text,
      bodyHtml: mail.html ?? null,
      deliveryStatus: "stored",
      sentAt: mail.receivedAt,
      createdAt: mail.receivedAt,
    });

    if (mail.attachments.length) {
      await db.insert(attachments).values(
        mail.attachments.map((attachment) => ({
          id: randomUUID(),
          messageId,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType ?? null,
          sizeBytes: attachment.sizeBytes,
          storagePath: buildAttachmentStoragePath(messageId, attachment.fileName),
          createdAt: mail.receivedAt,
        })),
      );
    }

    try {
      await db.insert(mailThreads).values({
        id: randomUUID(),
        ticketId: existingTicketId,
        messageId: mail.messageId,
        createdAt: mail.receivedAt,
      });
    } catch {}

    await db
      .update(tickets)
      .set({
        status: "open",
        lastActivityAt: mail.receivedAt,
        updatedAt: now(),
      })
      .where(eq(tickets.id, existingTicketId));

    return getTicketDetail(existingTicketId);
  }

  const tenant = await findTenantForEmail(mail.fromEmail);
  const customer = await ensureCustomerRecord(tenant!, mail);
  const sequenceNo = await getNextSequenceNo();
  const ticketId = randomUUID();

  await db.insert(tickets).values({
    id: ticketId,
    sequenceNo,
    ticketCode: createTicketCode(sequenceNo),
    tenantId: tenant!.id,
    customerId: customer!.id,
    assigneeId: null,
    subject: mail.subject,
    description: mail.text,
    status: "new",
    priority: "normal",
    sourceChannel: "email",
    firstReceivedAt: mail.receivedAt,
    firstResponseAt: null,
    resolvedAt: null,
    resolutionNote: null,
    lastActivityAt: mail.receivedAt,
    createdAt: mail.receivedAt,
    updatedAt: mail.receivedAt,
  });

  const firstMessageId = randomUUID();
  await db.insert(ticketMessages).values({
    id: firstMessageId,
    ticketId,
    authorType: "customer",
    direction: "inbound",
    sourceMessageId: mail.messageId,
    inReplyTo: mail.inReplyTo ?? null,
    referencesHeader: mail.references?.join(" ") ?? null,
    subject: mail.subject,
    bodyText: mail.text,
    bodyHtml: mail.html ?? null,
    deliveryStatus: "stored",
    sentAt: mail.receivedAt,
    createdAt: mail.receivedAt,
  });

  if (mail.attachments.length) {
    await db.insert(attachments).values(
      mail.attachments.map((attachment) => ({
        id: randomUUID(),
        messageId: firstMessageId,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType ?? null,
        sizeBytes: attachment.sizeBytes,
        storagePath: buildAttachmentStoragePath(firstMessageId, attachment.fileName),
        createdAt: mail.receivedAt,
      })),
    );
  }

  await db.insert(mailThreads).values({
    id: randomUUID(),
    ticketId,
    messageId: mail.messageId,
    createdAt: mail.receivedAt,
  });

  return getTicketDetail(ticketId);
}

export async function syncInbox() {
  const inboundMessages = await readInboxMessages();
  let processed = 0;

  for (const message of inboundMessages) {
    const beforeCount = hasDatabase
      ? undefined
      : (await loadMockStore()).tickets.reduce(
          (sum, ticket) =>
            sum +
              ticket.messages.filter(
                (item) => item.sourceMessageId === message.messageId,
              ).length,
          0,
        );

    await ingestInboundMail(message);

    if (!hasDatabase || !beforeCount) {
      processed += 1;
    }
  }

  return { processed, count: inboundMessages.length };
}

export async function updateTicket(input: {
  ticketId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string | null;
  resolutionNote?: string;
  adminEmail: string;
}) {
  if (!hasDatabase) {
    const store = await loadMockStore();
    const ticket = store.tickets.find((item) => item.id === input.ticketId);
    if (!ticket) return null;
    const assignee =
      input.assigneeId && input.assigneeId !== "unassigned"
        ? store.supportAgents.find((item) => item.id === input.assigneeId) ?? null
        : null;
    ticket.status = input.status;
    ticket.priority = input.priority;
    ticket.assigneeId = assignee?.id ?? null;
    ticket.assigneeName = assignee?.name ?? null;
    ticket.resolutionNote = input.resolutionNote ?? null;
    if (input.status === "resolved" || input.status === "closed") {
      ticket.resolvedAt = now();
    } else {
      ticket.resolvedAt = null;
    }
    ticket.lastActivityAt = now();
    await saveMockStore(store);
    await recordAudit({
      adminEmail: input.adminEmail,
      action: "ticket.update",
      entityType: "ticket",
      entityId: input.ticketId,
      summary: `Updated ${ticket.ticketCode}`,
    });
    return ticket;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  const resolvedAt =
    input.status === "resolved" || input.status === "closed" ? now() : null;

  await db
    .update(tickets)
    .set({
      status: input.status,
      priority: input.priority,
      assigneeId:
        input.assigneeId && input.assigneeId !== "unassigned" ? input.assigneeId : null,
      resolutionNote: input.resolutionNote ?? null,
      resolvedAt,
      lastActivityAt: now(),
      updatedAt: now(),
    })
    .where(eq(tickets.id, input.ticketId));

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "ticket.update",
    entityType: "ticket",
    entityId: input.ticketId,
    summary: `Updated ticket ${input.ticketId}`,
  });

  return getTicketDetail(input.ticketId);
}

export async function addTicketMessage(input: {
  ticketId: string;
  direction: "outbound" | "internal";
  bodyText: string;
  adminEmail: string;
}) {
  const detail = await getTicketDetail(input.ticketId);
  if (!detail) return null;

  const subject = `[#${detail.ticketCode}] ${detail.subject}`;
  const createdAt = now();

  if (!hasDatabase) {
    const store = await loadMockStore();
    const detail = store.tickets.find((item) => item.id === input.ticketId);
    if (!detail) return null;

    detail.messages.push({
      id: randomUUID(),
      ticketId: detail.id,
      authorType: "admin",
      direction: input.direction,
      bodyText: input.bodyText,
      subject,
      sourceMessageId: input.direction === "outbound" ? `outbound-${randomUUID()}` : null,
      createdAt,
      sentAt: input.direction === "outbound" ? createdAt : null,
      attachments: [],
    });
    detail.status = input.direction === "outbound" ? "waiting_customer" : detail.status;
    detail.lastActivityAt = createdAt;
    if (input.direction === "outbound" && !detail.firstResponseAt) {
      detail.firstResponseAt = createdAt;
    }
    await saveMockStore(store);
    await recordAudit({
      adminEmail: input.adminEmail,
      action: "ticket.reply",
      entityType: "ticket",
      entityId: detail.id,
      summary: `Added ${input.direction} note to ${detail.ticketCode}`,
    });
    return detail;
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return null;

  let deliveryStatus: "stored" | "sent" | "pending" | "failed" =
    input.direction === "internal" ? "stored" : "pending";

  if (input.direction === "outbound") {
    try {
      await sendTicketReply({
        to: detail.customerEmail,
        subject,
        bodyText: input.bodyText,
      });
      deliveryStatus = "sent";
    } catch {
      deliveryStatus = "failed";
    }
  }

  const messageId = randomUUID();

  await db.insert(ticketMessages).values({
    id: messageId,
    ticketId: detail.id,
    authorType: "admin",
    direction: input.direction,
    sourceMessageId: input.direction === "outbound" ? `outbound-${messageId}` : null,
    inReplyTo: null,
    referencesHeader: null,
    subject,
    bodyText: input.bodyText,
    bodyHtml: null,
    deliveryStatus,
    sentAt: input.direction === "outbound" ? createdAt : null,
    createdAt,
  });

  await db
    .update(tickets)
    .set({
      status: input.direction === "outbound" ? "waiting_customer" : detail.status,
      firstResponseAt: detail.firstResponseAt ?? (input.direction === "outbound" ? createdAt : null),
      lastActivityAt: createdAt,
      updatedAt: createdAt,
    })
    .where(eq(tickets.id, detail.id));

  if (input.direction === "outbound") {
    try {
      await db.insert(mailThreads).values({
        id: randomUUID(),
        ticketId: detail.id,
        messageId: `outbound-${messageId}`,
        createdAt,
      });
    } catch {}
  }

  await recordAudit({
    adminEmail: input.adminEmail,
    action: "ticket.reply",
    entityType: "ticket",
    entityId: detail.id,
    summary: `Added ${input.direction} note to ${detail.ticketCode}`,
  });

  return getTicketDetail(detail.id);
}

export async function buildMonthlyReport(filters: TicketFilters, format: "xlsx" | "pdf") {
  const ticketRows = await listTickets(filters);
  const metrics = calculateMetrics(ticketRows);

  if (format === "xlsx") {
    return buildExcelWorkbook({ tickets: ticketRows, metrics, filters });
  }

  return buildPdfBuffer({ tickets: ticketRows, metrics, filters });
}

export async function storeMonthlyReportLog(input: {
  tenantId: string;
  fromDate: Date;
  toDate: Date;
  format: "xlsx" | "pdf";
  filters: TicketFilters;
}) {
  if (!hasDatabase) return;

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) return;

  await db.insert(monthlyReports).values({
    id: randomUUID(),
    tenantId: input.tenantId,
    fromDate: input.fromDate,
    toDate: input.toDate,
    format: input.format,
    generatedAt: now(),
    filters: input.filters,
    filePath: null,
    successful: true,
  });
}
