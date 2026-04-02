import type { TicketPriority, TicketStatus } from "@/lib/types";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: "Yeni",
  open: "Açık",
  waiting_customer: "Müşteri yanıtı bekleniyor",
  resolved: "Çözüldü",
  closed: "Kapatıldı",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  critical: "Kritik",
};

export function getStatusLabel(value: TicketStatus) {
  return STATUS_LABELS[value];
}

export function getPriorityLabel(value: TicketPriority) {
  return PRIORITY_LABELS[value];
}

export function getActiveLabel(isActive: boolean) {
  return isActive ? "Aktif" : "Pasif";
}
