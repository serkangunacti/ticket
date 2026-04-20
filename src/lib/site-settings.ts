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

/* ── File-based fallback (DB mode) ── */
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

/* ── Public API ── */

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!hasDatabase) {
    const { loadMockStore } = await import("./mock-store");
    const store = await loadMockStore();
    return store.siteSettings ?? { ...DEFAULT_SETTINGS };
  }
  return readFromFile();
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
  const current = await readFromFile();
  const next = { ...current, ...patch };
  await writeToFile(next);
  return next;
}
