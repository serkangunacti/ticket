import { subDays, subHours } from "date-fns";

import type {
  CustomerRecord,
  SupportAgentRecord,
  TenantRecord,
  TicketDetail,
} from "@/lib/types";

const now = new Date();

export const mockTenants: TenantRecord[] = [
  {
    id: "tenant-1",
    name: "Acme Lojistik",
    slug: "acme-lojistik",
    supportAddress: "destek@uptexx.com",
    domains: ["acme.com.tr", "acmelojistik.com"],
    isActive: true,
    deactivatedAt: null,
    createdAt: subDays(now, 90),
  },
  {
    id: "tenant-2",
    name: "Nova Finans",
    slug: "nova-finans",
    supportAddress: "destek@uptexx.com",
    domains: ["novafinans.com"],
    isActive: true,
    deactivatedAt: null,
    createdAt: subDays(now, 45),
  },
];

export const mockSupportAgents: SupportAgentRecord[] = [
  {
    id: "agent-1",
    name: "Serkan Günaktı",
    email: "test@test.com",
    role: "owner",
    isActive: true,
    invitePending: false,
    createdAt: subDays(now, 120),
    deactivatedAt: null,
  },
];

export const mockCustomers: CustomerRecord[] = [
  {
    id: "customer-1",
    tenantId: "tenant-1",
    email: "selin.yilmaz@acme.com.tr",
    name: "Selin Yılmaz",
    companyName: "Acme Lojistik",
  },
  {
    id: "customer-2",
    tenantId: "tenant-2",
    email: "can.kaya@novafinans.com",
    name: "Can Kaya",
    companyName: "Nova Finans",
  },
];

export const mockTickets: TicketDetail[] = [
  {
    id: "ticket-1",
    ticketCode: "UPX-1001",
    tenantId: "tenant-1",
    tenantName: "Acme Lojistik",
    tenantIsActive: true,
    tenantDomains: ["acme.com.tr", "acmelojistik.com"],
    customerId: "customer-1",
    customerEmail: "selin.yilmaz@acme.com.tr",
    customerName: "Selin Yılmaz",
    assigneeId: "agent-1",
    assigneeName: "Serkan Günaktı",
    subject: "Power BI raporunda veri gecikmesi",
    description:
      "Sabah 09:00 sonrası satış verileri dashboard üzerinde görünmüyor.",
    status: "open",
    priority: "high",
    sourceChannel: "email",
    firstReceivedAt: subHours(now, 7),
    firstResponseAt: subHours(now, 6),
    resolvedAt: null,
    resolutionNote: null,
    lastActivityAt: subHours(now, 1),
    createdAt: subHours(now, 7),
    messages: [
      {
        id: "message-1",
        ticketId: "ticket-1",
        authorType: "customer",
        direction: "inbound",
        bodyText:
          "Merhaba, Power BI raporunda sabah saatlerinden beri veri güncellenmiyor.",
        createdAt: subHours(now, 7),
        sentAt: subHours(now, 7),
        subject: "Power BI raporunda veri gecikmesi",
        sourceMessageId: "<inbound-1@acme.com.tr>",
        attachments: [],
      },
      {
        id: "message-2",
        ticketId: "ticket-1",
        authorType: "admin",
        direction: "outbound",
        bodyText:
          "Kontrol ediyoruz. ETL job loglarını inceleyip size dönüş yapacağız.",
        createdAt: subHours(now, 6),
        sentAt: subHours(now, 6),
        subject: "[#UPX-1001] Power BI raporunda veri gecikmesi",
        sourceMessageId: "outbound-message-1",
        attachments: [],
      },
    ],
  },
  {
    id: "ticket-2",
    ticketCode: "UPX-1002",
    tenantId: "tenant-2",
    tenantName: "Nova Finans",
    tenantIsActive: true,
    tenantDomains: ["novafinans.com"],
    customerId: "customer-2",
    customerEmail: "can.kaya@novafinans.com",
    customerName: "Can Kaya",
    assigneeId: null,
    assigneeName: null,
    subject: "Copilot lisans aktivasyonu hakkında",
    description:
      "Yeni kullanıcı için Copilot lisans atamasında hata alınıyor.",
    status: "waiting_customer",
    priority: "normal",
    sourceChannel: "email",
    firstReceivedAt: subDays(now, 2),
    firstResponseAt: subDays(now, 2),
    resolvedAt: null,
    resolutionNote: null,
    lastActivityAt: subDays(now, 1),
    createdAt: subDays(now, 2),
    messages: [
      {
        id: "message-3",
        ticketId: "ticket-2",
        authorType: "customer",
        direction: "inbound",
        bodyText: "Merhaba, Copilot lisans atamasında yetki hatası alıyoruz.",
        createdAt: subDays(now, 2),
        sentAt: subDays(now, 2),
        subject: "Copilot lisans aktivasyonu hakkında",
        sourceMessageId: "<inbound-2@novafinans.com>",
        attachments: [],
      },
      {
        id: "message-4",
        ticketId: "ticket-2",
        authorType: "admin",
        direction: "outbound",
        bodyText: "Ekran görüntüsünü paylaşabilir misiniz?",
        createdAt: subDays(now, 2),
        sentAt: subDays(now, 2),
        subject: "[#UPX-1002] Copilot lisans aktivasyonu hakkında",
        sourceMessageId: "outbound-message-2",
        attachments: [],
      },
    ],
  },
];
