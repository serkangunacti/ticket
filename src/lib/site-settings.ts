import { cache } from "react";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { hasDatabase } from "./env";

export type SiteSettings = {
  companyName: string;
  logoDataUrl: string | null;
};

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "Uptexx Ticket",
  logoDataUrl: null,
};

export function slugify(name: string): string {
  return (
    name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_çÇğĞıİöÖşŞüÜ\u0080-\uFFFF-]/g, "") || "admin"
  );
}

/* ── File-based fallback (no-DB / mock mode) ── */
const DEFAULT_STORE_DIR =
  process.env.MOCK_STORE_DIR ?? path.join(os.tmpdir(), "uptexx-mock-store");
const STORE_DIR =
  process.env.NODE_ENV === "production"
    ? DEFAULT_STORE_DIR
    : path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(STORE_DIR, "site-settings.json");

async function readFromFile(): Promise<SiteSettings> {
  try {
    const content = await readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeToFile(settings: SiteSettings): Promise<void> {
  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

/* ── DB helpers ── */
const SETTINGS_ROW_ID = "site-settings-singleton";

async function readFromDb(): Promise<SiteSettings> {
  try {
    const { getDb, ensureDatabaseReady } = await import("./db");
    const { sql } = await import("drizzle-orm");
    await ensureDatabaseReady();
    const db = getDb();
    if (!db) return { ...DEFAULT_SETTINGS };

    const raw = await db.execute(
      sql`select company_name, logo_data_url from site_settings where id = ${SETTINGS_ROW_ID}`,
    );

    /* drizzle + mysql2 returns [rows, fields] */
    const rows = Array.isArray(raw) && Array.isArray(raw[0]) ? raw[0] : raw;
    const result = rows as unknown as Array<{ company_name: string; logo_data_url: string | null }>;
    if (!result || result.length === 0) return { ...DEFAULT_SETTINGS };
    return {
      companyName: result[0].company_name ?? DEFAULT_SETTINGS.companyName,
      logoDataUrl: result[0].logo_data_url ?? null,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

async function writeToDb(settings: SiteSettings): Promise<void> {
  try {
    const { getDb, ensureDatabaseReady } = await import("./db");
    const { sql } = await import("drizzle-orm");
    await ensureDatabaseReady();
    const db = getDb();
    if (!db) return;

    await db.execute(
      sql`insert into site_settings (id, company_name, logo_data_url, updated_at) values (${SETTINGS_ROW_ID}, ${settings.companyName}, ${settings.logoDataUrl}, now()) on duplicate key update company_name = values(company_name), logo_data_url = values(logo_data_url), updated_at = now()`,
    );
  } catch {
    /* If the table doesn't exist yet, fall back silently */
  }
}

/* ── Public API ── */

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!hasDatabase) {
    const { loadMockStore } = await import("./mock-store");
    const store = await loadMockStore();
    return store.siteSettings ?? { ...DEFAULT_SETTINGS };
  }
  return readFromDb();
});

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  if (!hasDatabase) {
    const { loadMockStore, saveMockStore } = await import("./mock-store");
    const store = await loadMockStore();
    const current = store.siteSettings ?? { ...DEFAULT_SETTINGS };
    const next = { ...current, ...patch };
    store.siteSettings = next;
    await saveMockStore(store);
    return next;
  }
  const current = await readFromDb();
  const next = { ...current, ...patch };
  await writeToDb(next);
  return next;
}
