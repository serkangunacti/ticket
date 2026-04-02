import { promises as fs } from "node:fs";
import path from "node:path";

import {
  mockCustomers,
  mockSupportAgents,
  mockTenants,
  mockTickets,
} from "@/lib/mock-data";
import type {
  CustomerRecord,
  SupportAgentRecord,
  TenantRecord,
  TicketDetail,
} from "@/lib/types";

type AuditEntry = {
  id: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: Date;
};

export type MockStore = {
  tenants: TenantRecord[];
  supportAgents: SupportAgentRecord[];
  customers: CustomerRecord[];
  tickets: TicketDetail[];
  auditLogs: AuditEntry[];
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "mock-store.json");

function createInitialStore(): MockStore {
  return {
    tenants: structuredClone(mockTenants),
    supportAgents: structuredClone(mockSupportAgents),
    customers: structuredClone(mockCustomers),
    tickets: structuredClone(mockTickets),
    auditLogs: [],
  };
}

function reviveStore(payload: MockStore): MockStore {
  return {
    tenants: (payload.tenants ?? []).map((tenant) => ({
      ...tenant,
      isActive: tenant.isActive ?? true,
      deactivatedAt: tenant.deactivatedAt ? new Date(tenant.deactivatedAt) : null,
      createdAt: new Date(tenant.createdAt),
    })),
    supportAgents: (payload.supportAgents ?? mockSupportAgents).map((agent) => ({
      ...agent,
      role: agent.role ?? "agent",
      isActive: agent.isActive ?? true,
      invitePending: agent.invitePending ?? false,
      createdAt: new Date(agent.createdAt),
      deactivatedAt: agent.deactivatedAt ? new Date(agent.deactivatedAt) : null,
    })),
    customers: payload.customers,
    tickets: payload.tickets.map((ticket) => ({
      ...ticket,
      tenantIsActive: ticket.tenantIsActive ?? true,
      assigneeId: ticket.assigneeId ?? null,
      assigneeName: ticket.assigneeName ?? null,
      firstReceivedAt: new Date(ticket.firstReceivedAt),
      firstResponseAt: ticket.firstResponseAt ? new Date(ticket.firstResponseAt) : null,
      resolvedAt: ticket.resolvedAt ? new Date(ticket.resolvedAt) : null,
      lastActivityAt: new Date(ticket.lastActivityAt),
      createdAt: new Date(ticket.createdAt),
      messages: ticket.messages.map((message) => ({
        ...message,
        sentAt: message.sentAt ? new Date(message.sentAt) : null,
        createdAt: new Date(message.createdAt),
      })),
    })),
    auditLogs: payload.auditLogs.map((entry) => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
    })),
  };
}

export async function loadMockStore(): Promise<MockStore> {
  try {
    const content = await fs.readFile(STORE_FILE, "utf8");
    return reviveStore(JSON.parse(content) as MockStore);
  } catch {
    const initial = createInitialStore();
    await saveMockStore(initial);
    return initial;
  }
}

export async function saveMockStore(store: MockStore) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}
