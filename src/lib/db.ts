import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env, hasDatabase } from "@/lib/env";

let pool: mysql.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;
let schemaReadyPromise: Promise<void> | null = null;

function shouldUseManagedTls() {
  if (!env.DATABASE_URL) return false;

  try {
    return new URL(env.DATABASE_URL).hostname.endsWith("tidbcloud.com");
  } catch {
    return false;
  }
}

export function getDb() {
  if (!hasDatabase) return null;

  if (!pool) {
    pool = mysql.createPool({
      uri: env.DATABASE_URL,
      connectionLimit: 10,
      namedPlaceholders: true,
      ssl: shouldUseManagedTls()
        ? {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2",
          }
        : undefined,
    });
  }

  if (!dbInstance) {
    dbInstance = drizzle(pool as never) as ReturnType<typeof drizzle>;
  }

  return dbInstance;
}

export async function ensureDatabaseReady() {
  if (!hasDatabase) return;

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const db = getDb();
      if (!db || !pool) return;

      const ddlStatements = [
        `create table if not exists admin_users (
          id varchar(36) not null primary key,
          email varchar(255) not null,
          name varchar(255) not null,
          password_hash varchar(255) not null,
          created_at datetime not null,
          updated_at datetime not null,
          unique key admin_users_email_idx (email)
        )`,
        `create table if not exists tenants (
          id varchar(36) not null primary key,
          name varchar(255) not null,
          slug varchar(255) not null,
          support_address varchar(255) not null,
          is_active boolean not null default true,
          deactivated_at datetime null,
          created_at datetime not null,
          updated_at datetime not null,
          unique key tenants_slug_idx (slug)
        )`,
        `create table if not exists support_agents (
          id varchar(36) not null primary key,
          name varchar(255) not null,
          email varchar(255) not null,
          role enum('owner','manager','agent') not null default 'agent',
          password_hash varchar(255) null,
          invite_token varchar(255) null,
          invite_expires_at datetime null,
          invited_at datetime null,
          is_active boolean not null default true,
          created_at datetime not null,
          deactivated_at datetime null,
          updated_at datetime not null,
          unique key support_agents_email_idx (email)
        )`,
        `create table if not exists tenant_domains (
          id varchar(36) not null primary key,
          tenant_id varchar(36) not null,
          domain varchar(255) not null,
          created_at datetime not null,
          unique key tenant_domains_domain_idx (domain),
          key tenant_domains_tenant_idx (tenant_id)
        )`,
        `create table if not exists customers (
          id varchar(36) not null primary key,
          tenant_id varchar(36) not null,
          email varchar(255) not null,
          name varchar(255) null,
          company_name varchar(255) null,
          created_at datetime not null,
          updated_at datetime not null,
          unique key customers_tenant_email_idx (tenant_id, email)
        )`,
        `create table if not exists tickets (
          id varchar(36) not null primary key,
          sequence_no int not null auto_increment,
          ticket_code varchar(24) not null,
          tenant_id varchar(36) not null,
          customer_id varchar(36) not null,
          assignee_id varchar(36) null,
          subject varchar(255) not null,
          description text not null,
          status enum('new','open','waiting_customer','resolved','closed') not null,
          priority enum('low','normal','high','critical') not null,
          source_channel enum('email','manual') not null,
          first_received_at datetime not null,
          first_response_at datetime null,
          resolved_at datetime null,
          resolution_note text null,
          last_activity_at datetime not null,
          created_at datetime not null,
          updated_at datetime not null,
          unique key tickets_sequence_idx (sequence_no),
          unique key tickets_code_idx (ticket_code),
          key tickets_tenant_idx (tenant_id),
          key tickets_customer_idx (customer_id),
          key tickets_assignee_idx (assignee_id)
        )`,
        `create table if not exists ticket_messages (
          id varchar(36) not null primary key,
          ticket_id varchar(36) not null,
          author_type enum('admin','customer','system') not null,
          direction enum('inbound','outbound','internal') not null,
          source_message_id varchar(255) null,
          in_reply_to varchar(255) null,
          references_header text null,
          subject varchar(255) null,
          body_text text not null,
          body_html text null,
          delivery_status enum('stored','sent','pending','failed') not null,
          sent_at datetime null,
          created_at datetime not null,
          unique key ticket_messages_source_msg_idx (source_message_id),
          key ticket_messages_ticket_idx (ticket_id)
        )`,
        `create table if not exists attachments (
          id varchar(36) not null primary key,
          message_id varchar(36) not null,
          file_name varchar(255) not null,
          mime_type varchar(255) null,
          size_bytes int not null,
          storage_path varchar(255) not null,
          created_at datetime not null,
          key attachments_message_idx (message_id)
        )`,
        `create table if not exists mail_threads (
          id varchar(36) not null primary key,
          ticket_id varchar(36) not null,
          message_id varchar(255) not null,
          created_at datetime not null,
          unique key mail_threads_message_idx (message_id),
          key mail_threads_ticket_idx (ticket_id)
        )`,
        `create table if not exists audit_logs (
          id varchar(36) not null primary key,
          admin_email varchar(255) not null,
          action varchar(80) not null,
          entity_type varchar(80) not null,
          entity_id varchar(36) not null,
          summary text not null,
          meta json null,
          created_at datetime not null,
          key audit_logs_entity_idx (entity_type, entity_id)
        )`,
        `create table if not exists monthly_reports (
          id varchar(36) not null primary key,
          tenant_id varchar(36) not null,
          from_date datetime not null,
          to_date datetime not null,
          format enum('xlsx','pdf') not null,
          generated_at datetime not null,
          filters json null,
          file_path varchar(255) null,
          successful boolean not null,
          key monthly_reports_tenant_idx (tenant_id)
        )`,
        `create table if not exists site_settings (
          id varchar(36) not null primary key,
          company_name varchar(255) not null default 'Uptexx Ticket',
          logo_data_url mediumtext null,
          updated_at datetime not null
        )`,
      ];

      const connection = await pool.getConnection();

      try {
        for (const statement of ddlStatements) {
          await connection.query(statement);
        }

        const alterStatements = [
          "alter table tenants add column if not exists is_active boolean not null default true",
          "alter table tenants add column if not exists deactivated_at datetime null",
          "alter table support_agents add column if not exists role enum('owner','manager','agent') not null default 'agent'",
          "alter table support_agents add column if not exists password_hash varchar(255) null",
          "alter table support_agents add column if not exists invite_token varchar(255) null",
          "alter table support_agents add column if not exists invite_expires_at datetime null",
          "alter table support_agents add column if not exists invited_at datetime null",
          "alter table tickets add column if not exists assignee_id varchar(36) null",
          "create index if not exists tickets_assignee_idx on tickets (assignee_id)",
        ];

        for (const statement of alterStatements) {
          await connection.query(statement);
        }
      } finally {
        connection.release();
      }
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }

  await schemaReadyPromise;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
  }
}
