import { clsx } from "clsx";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatDateTime(
  value: Date | string | null | undefined,
  locale = "tr-TR",
) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDurationMinutes(minutes: number | null | undefined) {
  if (minutes == null) return "-";
  if (minutes < 60) return `${minutes} dk`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (!rest) return `${hours} sa`;
  return `${hours} sa ${rest} dk`;
}

export function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createTicketCode(sequenceNo: number) {
  return `UPX-${String(sequenceNo).padStart(4, "0")}`;
}

export function normalizeReferences(references?: string | null) {
  if (!references) return [];
  return references
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}
