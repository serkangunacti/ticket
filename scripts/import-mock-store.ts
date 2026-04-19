import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";

import { closeDb, ensureDatabaseReady, getDb } from "@/lib/db";
import { env, hasDatabase } from "@/lib/env";
import {
  attachments,
  auditLogs,
  customers,
  mailThreads,
  supportAgents,
  tenantDomains,
  tenants,
  ticketMessages,
  tickets,
} from "@/lib/schema";
import type { MockStore } from "@/lib/mock-store";

const STORE_FILE = path.join(process.cwd(), ".data", "mock-store.json");

type DeliveryStatus = "stored" | "sent" | "pending" | "failed";

function toDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function parseSequenceNo(ticketCode: string) {
  const match = ticketCode.match(/(\d+)$/);
  return Number(match?.[1] ?? 0);
}

async function loadExistingMockStore() {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as MockStore;

    return {
      ...parsed,
      tenants: parsed.tenants.map((tenant) => ({
        ...tenant,
        deactivatedAt: toDate(tenant.deactivatedAt),
        createdAt: new Date(tenant.createdAt),
      })),
      supportAgents: parsed.supportAgents.map((agent) => ({
        ...agent,
        deactivatedAt: toDate(agent.deactivatedAt),
        createdAt: new Date(agent.createdAt),
      })),
      customers: parsed.customers,
      tickets: parsed.tickets.map((ticket) => ({
        ...ticket,
        firstReceivedAt: new Date(ticket.firstReceivedAt),
        firstResponseAt: toDate(ticket.firstResponseAt),
        resolvedAt: toDate(ticket.resolvedAt),
        lastActivityAt: new Date(ticket.lastActivityAt),
        createdAt: new Date(ticket.createdAt),
        messages: ticket.messages.map((message) => ({
          ...message,
          sentAt: toDate(message.sentAt),
          createdAt: new Date(message.createdAt),
        })),
      })),
      auditLogs: parsed.auditLogs.map((entry) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
      })),
    } satisfies MockStore;
  } catch {
    return null;
  }
}

async function main() {
  if (!hasDatabase || !env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Cannot import into TiDB.");
  }

  const store = await loadExistingMockStore();
  if (!store) {
    throw new Error("No .data/mock-store.json file found. There is no mock data to import.");
  }

  await ensureDatabaseReady();

  const db = getDb();
  if (!db) {
    throw new Error("Database connection could not be created.");
  }

  const [ticketCountRows, tenantCountRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(tickets),
    db.select({ count: sql<number>`count(*)` }).from(tenants),
  ]);

  const existingTickets = Number(ticketCountRows[0]?.count ?? 0);
  const existingTenants = Number(tenantCountRows[0]?.count ?? 0);

  if ((existingTickets > 0 || existingTenants > 0) && process.env.FORCE_MOCK_IMPORT !== "true") {
    throw new Error(
      "Target database is not empty. Abort import to avoid duplicates. Set FORCE_MOCK_IMPORT=true only if you intentionally want to continue.",
    );
  }

  if (store.tenants.length) {
    await db.insert(tenants).values(
      store.tenants.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        supportAddress: tenant.supportAddress,
        isActive: tenant.isActive,
        deactivatedAt: tenant.deactivatedAt,
        createdAt: tenant.createdAt,
        updatedAt: tenant.createdAt,
      })),
    );
  }

  const domainRows = store.tenants.flatMap((tenant) =>
    tenant.domains.map((domain) => ({
      id: randomUUID(),
      tenantId: tenant.id,
      domain,
      createdAt: tenant.createdAt,
    })),
  );
  if (domainRows.length) {
    await db.insert(tenantDomains).values(domainRows);
  }

  if (store.supportAgents.length) {
    await db.insert(supportAgents).values(
      await Promise.all(
        store.supportAgents.map(async (agent) => ({
          id: agent.id,
          name: agent.name,
          email: agent.email,
          role: agent.role,
          passwordHash:
            agent.email === env.ADMIN_EMAIL && env.ADMIN_PASSWORD
              ? await hash(env.ADMIN_PASSWORD, 10)
              : null,
          inviteToken: null,
          inviteExpiresAt: null,
          invitedAt: agent.createdAt,
          isActive: agent.isActive,
          createdAt: agent.createdAt,
          deactivatedAt: agent.deactivatedAt,
          updatedAt: agent.createdAt,
        })),
      ),
    );
  }

  const customerTimestamps = new Map<string, Date>();
  for (const ticket of store.tickets) {
    const previous = customerTimestamps.get(ticket.customerId);
    if (!previous || ticket.createdAt < previous) {
      customerTimestamps.set(ticket.customerId, ticket.createdAt);
    }
  }

  if (store.customers.length) {
    await db.insert(customers).values(
      store.customers.map((customer) => {
        const createdAt = customerTimestamps.get(customer.id) ?? new Date();
        return {
          id: customer.id,
          tenantId: customer.tenantId,
          email: customer.email,
          name: customer.name,
          companyName: customer.companyName,
          createdAt,
          updatedAt: createdAt,
        };
      }),
    );
  }

  if (store.tickets.length) {
    await db.insert(tickets).values(
      store.tickets.map((ticket) => ({
        id: ticket.id,
        sequenceNo: parseSequenceNo(ticket.ticketCode),
        ticketCode: ticket.ticketCode,
        tenantId: ticket.tenantId,
        customerId: ticket.customerId,
        assigneeId: ticket.assigneeId,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        sourceChannel: ticket.sourceChannel,
        firstReceivedAt: ticket.firstReceivedAt,
        firstResponseAt: ticket.firstResponseAt,
        resolvedAt: ticket.resolvedAt,
        resolutionNote: ticket.resolutionNote,
        lastActivityAt: ticket.lastActivityAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.lastActivityAt,
      })),
    );
  }

  const messageRows = store.tickets.flatMap((ticket) =>
    ticket.messages.map((message) => {
      const deliveryStatus: DeliveryStatus =
        message.direction === "outbound"
          ? "sent"
          : message.direction === "internal"
            ? "stored"
            : "stored";

      return {
        id: message.id,
        ticketId: ticket.id,
        authorType: message.authorType,
        direction: message.direction,
        sourceMessageId: message.sourceMessageId ?? null,
        inReplyTo: null,
        referencesHeader: null,
        subject: message.subject ?? null,
        bodyText: message.bodyText,
        bodyHtml: message.bodyHtml ?? null,
        deliveryStatus,
        sentAt: message.sentAt,
        createdAt: message.createdAt,
      };
    }),
  );
  if (messageRows.length) {
    await db.insert(ticketMessages).values(messageRows);
  }

  const attachmentRows = store.tickets.flatMap((ticket) =>
    ticket.messages.flatMap((message) =>
      message.attachments.map((attachment) => ({
        id: attachment.id,
        messageId: message.id,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        storagePath: attachment.storagePath,
        createdAt: message.createdAt,
      })),
    ),
  );
  if (attachmentRows.length) {
    await db.insert(attachments).values(attachmentRows);
  }

  const threadRows = store.tickets.flatMap((ticket) =>
    ticket.messages
      .filter((message) => message.sourceMessageId)
      .map((message) => ({
        id: randomUUID(),
        ticketId: ticket.id,
        messageId: message.sourceMessageId!,
        createdAt: message.createdAt,
      })),
  );
  if (threadRows.length) {
    await db.insert(mailThreads).values(threadRows);
  }

  if (store.auditLogs.length) {
    await db.insert(auditLogs).values(
      store.auditLogs.map((entry) => ({
        id: entry.id,
        adminEmail: entry.adminEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        summary: entry.summary,
        meta: null,
        createdAt: entry.createdAt,
      })),
    );
  }

  console.log("Mock store import completed.");
  console.log(`Imported tenants: ${store.tenants.length}`);
  console.log(`Imported support agents: ${store.supportAgents.length}`);
  console.log(`Imported customers: ${store.customers.length}`);
  console.log(`Imported tickets: ${store.tickets.length}`);
  console.log(`Imported audit logs: ${store.auditLogs.length}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });