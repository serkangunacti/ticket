import {
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const adminUsers = mysqlTable(
  "admin_users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("admin_users_email_idx").on(table.email),
  }),
);

export const tenants = mysqlTable(
  "tenants",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    supportAddress: varchar("support_address", { length: 255 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    deactivatedAt: datetime("deactivated_at", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("tenants_slug_idx").on(table.slug),
  }),
);

export const supportAgents = mysqlTable(
  "support_agents",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    deactivatedAt: datetime("deactivated_at", { mode: "date" }),
    updatedAt: datetime("updated_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("support_agents_email_idx").on(table.email),
  }),
);

export const tenantDomains = mysqlTable(
  "tenant_domains",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    domainIdx: uniqueIndex("tenant_domains_domain_idx").on(table.domain),
    tenantIdx: index("tenant_domains_tenant_idx").on(table.tenantId),
  }),
);

export const customers = mysqlTable(
  "customers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    companyName: varchar("company_name", { length: 255 }),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    customerIdx: uniqueIndex("customers_tenant_email_idx").on(
      table.tenantId,
      table.email,
    ),
  }),
);

export const tickets = mysqlTable(
  "tickets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sequenceNo: int("sequence_no").autoincrement().notNull(),
    ticketCode: varchar("ticket_code", { length: 24 }).notNull(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    customerId: varchar("customer_id", { length: 36 }).notNull(),
    assigneeId: varchar("assignee_id", { length: 36 }),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: mysqlEnum("status", [
      "new",
      "open",
      "waiting_customer",
      "resolved",
      "closed",
    ]).notNull(),
    priority: mysqlEnum("priority", [
      "low",
      "normal",
      "high",
      "critical",
    ]).notNull(),
    sourceChannel: mysqlEnum("source_channel", ["email", "manual"]).notNull(),
    firstReceivedAt: datetime("first_received_at", { mode: "date" }).notNull(),
    firstResponseAt: datetime("first_response_at", { mode: "date" }),
    resolvedAt: datetime("resolved_at", { mode: "date" }),
    resolutionNote: text("resolution_note"),
    lastActivityAt: datetime("last_activity_at", { mode: "date" }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    ticketCodeIdx: uniqueIndex("tickets_code_idx").on(table.ticketCode),
    tenantIdx: index("tickets_tenant_idx").on(table.tenantId),
    customerIdx: index("tickets_customer_idx").on(table.customerId),
    assigneeIdx: index("tickets_assignee_idx").on(table.assigneeId),
  }),
);

export const ticketMessages = mysqlTable(
  "ticket_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ticketId: varchar("ticket_id", { length: 36 }).notNull(),
    authorType: mysqlEnum("author_type", ["admin", "customer", "system"])
      .notNull(),
    direction: mysqlEnum("direction", ["inbound", "outbound", "internal"])
      .notNull(),
    sourceMessageId: varchar("source_message_id", { length: 255 }),
    inReplyTo: varchar("in_reply_to", { length: 255 }),
    referencesHeader: text("references_header"),
    subject: varchar("subject", { length: 255 }),
    bodyText: text("body_text").notNull(),
    bodyHtml: text("body_html"),
    deliveryStatus: mysqlEnum("delivery_status", [
      "stored",
      "sent",
      "pending",
      "failed",
    ]).notNull(),
    sentAt: datetime("sent_at", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    ticketIdx: index("ticket_messages_ticket_idx").on(table.ticketId),
    sourceMsgIdx: uniqueIndex("ticket_messages_source_msg_idx").on(
      table.sourceMessageId,
    ),
  }),
);

export const attachments = mysqlTable(
  "attachments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    messageId: varchar("message_id", { length: 36 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }),
    sizeBytes: int("size_bytes").notNull(),
    storagePath: varchar("storage_path", { length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    messageIdx: index("attachments_message_idx").on(table.messageId),
  }),
);

export const mailThreads = mysqlTable(
  "mail_threads",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ticketId: varchar("ticket_id", { length: 36 }).notNull(),
    messageId: varchar("message_id", { length: 255 }).notNull(),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    messageIdx: uniqueIndex("mail_threads_message_idx").on(table.messageId),
    ticketIdx: index("mail_threads_ticket_idx").on(table.ticketId),
  }),
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    adminEmail: varchar("admin_email", { length: 255 }).notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    summary: text("summary").notNull(),
    meta: json("meta"),
    createdAt: datetime("created_at", { mode: "date" }).notNull(),
  },
  (table) => ({
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  }),
);

export const monthlyReports = mysqlTable(
  "monthly_reports",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    tenantId: varchar("tenant_id", { length: 36 }).notNull(),
    fromDate: datetime("from_date", { mode: "date" }).notNull(),
    toDate: datetime("to_date", { mode: "date" }).notNull(),
    format: mysqlEnum("format", ["xlsx", "pdf"]).notNull(),
    generatedAt: datetime("generated_at", { mode: "date" }).notNull(),
    filters: json("filters"),
    filePath: varchar("file_path", { length: 255 }),
    successful: boolean("successful").notNull(),
  },
  (table) => ({
    tenantIdx: index("monthly_reports_tenant_idx").on(table.tenantId),
  }),
);
