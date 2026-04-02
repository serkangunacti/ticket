export type TicketStatus =
  | "new"
  | "open"
  | "waiting_customer"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "normal" | "high" | "critical";

export type Direction = "inbound" | "outbound" | "internal";

export type TenantRecord = {
  id: string;
  name: string;
  slug: string;
  supportAddress: string;
  domains: string[];
  isActive: boolean;
  deactivatedAt: Date | null;
  createdAt: Date;
};

export type SupportAgentRecord = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  deactivatedAt: Date | null;
};

export type CustomerRecord = {
  id: string;
  tenantId: string;
  email: string;
  name: string | null;
  companyName: string | null;
};

export type AttachmentRecord = {
  id: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number;
  storagePath: string;
};

export type TicketMessageRecord = {
  id: string;
  ticketId: string;
  authorType: "admin" | "customer" | "system";
  direction: Direction;
  sourceMessageId?: string | null;
  subject?: string | null;
  bodyText: string;
  bodyHtml?: string | null;
  sentAt?: Date | null;
  createdAt: Date;
  attachments: AttachmentRecord[];
};

export type TicketListItem = {
  id: string;
  ticketCode: string;
  tenantId: string;
  tenantName: string;
  tenantIsActive: boolean;
  customerId: string;
  customerEmail: string;
  customerName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  sourceChannel: "email" | "manual";
  firstReceivedAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  resolutionNote: string | null;
  lastActivityAt: Date;
  createdAt: Date;
};

export type TicketDetail = TicketListItem & {
  tenantDomains: string[];
  messages: TicketMessageRecord[];
};

export type TicketFilters = {
  tenantId?: string;
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  query?: string;
  from?: string;
  to?: string;
};

export type InboundAttachment = {
  fileName: string;
  mimeType?: string | null;
  sizeBytes: number;
  content?: Buffer;
};

export type InboundMail = {
  messageId: string;
  inReplyTo?: string | null;
  references?: string[];
  fromEmail: string;
  fromName?: string | null;
  toEmail: string;
  subject: string;
  text: string;
  html?: string | null;
  receivedAt: Date;
  attachments: InboundAttachment[];
};

export type ReportMetrics = {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageFirstResponseMinutes: number | null;
  averageResolutionMinutes: number | null;
};
