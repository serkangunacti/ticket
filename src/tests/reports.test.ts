import { subHours } from "date-fns";
import { describe, expect, it } from "vitest";

import { calculateMetrics } from "../lib/reports";
import type { TicketListItem } from "../lib/types";

const now = new Date("2026-04-02T12:00:00.000Z");

const tickets: TicketListItem[] = [
  {
    id: "1",
    ticketCode: "UPX-1001",
    tenantId: "tenant-1",
    tenantName: "Acme",
    customerId: "customer-1",
    customerEmail: "test@acme.com",
    customerName: "Test",
    subject: "Birinci ticket",
    description: "A",
    status: "resolved",
    priority: "high",
    sourceChannel: "email",
    firstReceivedAt: subHours(now, 4),
    firstResponseAt: subHours(now, 3),
    resolvedAt: subHours(now, 1),
    resolutionNote: null,
    lastActivityAt: subHours(now, 1),
    createdAt: subHours(now, 4),
  },
  {
    id: "2",
    ticketCode: "UPX-1002",
    tenantId: "tenant-1",
    tenantName: "Acme",
    customerId: "customer-2",
    customerEmail: "test2@acme.com",
    customerName: "Test 2",
    subject: "Ikinci ticket",
    description: "B",
    status: "open",
    priority: "normal",
    sourceChannel: "email",
    firstReceivedAt: subHours(now, 2),
    firstResponseAt: null,
    resolvedAt: null,
    resolutionNote: null,
    lastActivityAt: subHours(now, 1),
    createdAt: subHours(now, 2),
  },
];

describe("report metrics", () => {
  it("calculates summary metrics", () => {
    const metrics = calculateMetrics(tickets);

    expect(metrics.totalTickets).toBe(2);
    expect(metrics.openTickets).toBe(1);
    expect(metrics.closedTickets).toBe(1);
    expect(metrics.averageFirstResponseMinutes).toBe(60);
    expect(metrics.averageResolutionMinutes).toBe(180);
  });
});
