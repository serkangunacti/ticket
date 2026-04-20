import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export type SiteSettings = {
  companyName: string;
  logoDataUrl: string | null;
};

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "Uptexx Ticket",
  logoDataUrl: null,
};

const DEFAULT_STORE_DIR =
  process.env.MOCK_STORE_DIR ?? path.join(os.tmpdir(), "uptexx-mock-store");
const STORE_DIR =
  process.env.NODE_ENV === "production"
    ? DEFAULT_STORE_DIR
    : path.join(process.cwd(), ".data");
const SETTINGS_FILE = path.join(STORE_DIR, "site-settings.json");

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const content = await readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next = { ...current, ...patch };
  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2));
  return next;
}
