import { z } from "zod";

const envSchema = z.object({
  APP_NAME: z.string().default("Uptexx Ticket"),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  M365_TENANT_ID: z.string().optional(),
  M365_CLIENT_ID: z.string().optional(),
  M365_CLIENT_SECRET: z.string().optional(),
  M365_SHARED_MAILBOX: z.string().default("destek@uptexx.com"),
  MAIL_SYNC_MODE: z.enum(["fixtures", "microsoft"]).default("fixtures"),
  MAIL_FIXTURE_DIR: z.string().default("fixtures/mailbox"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export const env = envSchema.parse({
  APP_NAME: process.env.APP_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  M365_TENANT_ID: process.env.M365_TENANT_ID,
  M365_CLIENT_ID: process.env.M365_CLIENT_ID,
  M365_CLIENT_SECRET: process.env.M365_CLIENT_SECRET,
  M365_SHARED_MAILBOX: process.env.M365_SHARED_MAILBOX,
  MAIL_SYNC_MODE: process.env.MAIL_SYNC_MODE,
  MAIL_FIXTURE_DIR: process.env.MAIL_FIXTURE_DIR,
  NODE_ENV: process.env.NODE_ENV,
});

export const hasDatabase = Boolean(env.DATABASE_URL);
export const hasAdminCredentials = Boolean(
  env.ADMIN_EMAIL && env.ADMIN_PASSWORD,
);
export const hasMicrosoftMail = Boolean(
  env.M365_TENANT_ID &&
    env.M365_CLIENT_ID &&
    env.M365_CLIENT_SECRET &&
    env.M365_SHARED_MAILBOX,
);
