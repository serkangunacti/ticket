import Link from "next/link";
import {
  AlertTriangle,
  Clock3,
  Download,
  Filter,
  ImagePlus,
  MailOpen,
  PenLine,
} from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { MetricTile, PriorityBadge, StatusBadge, Surface } from "@/components/ticket-ui";
import { requireAdminSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { calculateMetrics } from "@/lib/reports";
import { listAuditLogs, listTenants, listTickets } from "@/lib/data";
import type { TicketFilters, TicketListItem } from "@/lib/types";
import { formatDateTime, formatDurationMinutes } from "@/lib/utils";

import { createManualTicketAction } from "./actions";

export const dynamic = "force-dynamic";

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#102b4d_0%,#173d67_100%)] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(7,21,38,0.18)]";
const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[rgba(17,35,60,0.1)] bg-white/80 px-4 text-sm font-semibold text-[#102038] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(7,21,38,0.08)]";
const panelClass =
  "border-[rgba(17,35,60,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(246,249,252,0.94)_100%)] shadow-[0_18px_44px_rgba(8,25,47,0.08)]";
const softPanelClass =
  "border-[rgba(17,35,60,0.08)] bg-[linear-gradient(180deg,rgba(247,250,252,0.94)_0%,rgba(240,245,249,0.94)_100%)] shadow-[0_12px_30px_rgba(8,25,47,0.05)]";
const pillClass =
  "inline-flex items-center rounded-full border border-[rgba(17,35,60,0.08)] bg-white/78 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#5f738c]";

const openStatuses = new Set(["new", "open", "waiting_customer"]);

type SearchParamMap = Record<string, string | string[] | undefined>;

type AttentionSignal = {
  reason: string;
  detail: string;
  score: number;
};

type AttentionItem = AttentionSignal & {
  ticketId: string;
  ticketCode: string;
  subject: string;
  tenantName: string;
  priority: TicketListItem["priority"];
  status: TicketListItem["status"];
};

type AttentionSummary = {
  items: AttentionItem[];
  totalCount: number;
};

function getSearchParamValue(searchParams: SearchParamMap, key: string) {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

function getFilters(
  searchParams: SearchParamMap,
): TicketFilters {
  return {
    tenantId: getSearchParamValue(searchParams, "tenantId"),
    status: getSearchParamValue(searchParams, "status") as TicketFilters["status"],
    priority: getSearchParamValue(searchParams, "priority") as TicketFilters["priority"],
    query: getSearchParamValue(searchParams, "query"),
    from: getSearchParamValue(searchParams, "from"),
    to: getSearchParamValue(searchParams, "to"),
  };
}

function buildReportQuery(filters: TicketFilters, format: "xlsx" | "pdf") {
  const params = new URLSearchParams();
  params.set("format", format);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `/api/reports/export?${params.toString()}`;
}

function getAttentionSignal(ticket: TicketListItem, nowTime: number): AttentionSignal | null {
  if (!openStatuses.has(ticket.status)) {
    return null;
  }

  const ageMinutes = Math.max(
    0,
    Math.round((nowTime - ticket.firstReceivedAt.getTime()) / 60000),
  );
  const idleMinutes = Math.max(
    0,
    Math.round((nowTime - ticket.lastActivityAt.getTime()) / 60000),
  );
  const isHighPriority = ticket.priority === "critical" || ticket.priority === "high";

  if (!ticket.assigneeId) {
    return {
      reason: "Atama bekliyor",
      detail: `${formatDurationMinutes(ageMinutes)} önce açıldı`,
      score: isHighPriority ? 120 : 100,
    };
  }

  if (isHighPriority && !ticket.firstResponseAt && ageMinutes >= 30) {
    return {
      reason: "İlk yanıt gecikiyor",
      detail: `${formatDurationMinutes(ageMinutes)} boyunca ilk yanıt verilmedi`,
      score: ticket.priority === "critical" ? 110 : 90,
    };
  }

  if (ticket.status === "waiting_customer" && idleMinutes >= 48 * 60) {
    return {
      reason: "Takip gerekiyor",
      detail: `${formatDurationMinutes(idleMinutes)} önce son hareket alındı`,
      score: 80,
    };
  }

  if ((ticket.status === "new" || ticket.status === "open") && idleMinutes >= 24 * 60) {
    return {
      reason: "Uzun süredir hareketsiz",
      detail: `${formatDurationMinutes(idleMinutes)} önce güncellendi`,
      score: 70,
    };
  }

  return null;
}

function buildAttentionSummary(tickets: TicketListItem[]): AttentionSummary {
  const nowTime = Date.now();

  const items = tickets
    .map((ticket) => {
      const signal = getAttentionSignal(ticket, nowTime);
      if (!signal) return null;

      return {
        ...signal,
        ticketId: ticket.id,
        ticketCode: ticket.ticketCode,
        subject: ticket.subject,
        tenantName: ticket.tenantName,
        priority: ticket.priority,
        status: ticket.status,
      } satisfies AttentionItem;
    })
    .filter((item): item is AttentionItem => item !== null)
    .sort((left, right) => right.score - left.score);

  return {
    items: items.slice(0, 6),
    totalCount: items.length,
  };
}

export default async function AdminDashboard(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const session = await requireAdminSession();
  const filters = getFilters(searchParams);
  const [tenants, tickets, auditLogs] = await Promise.all([
    listTenants(),
    listTickets(filters),
    listAuditLogs(8),
  ]);
  const metrics = calculateMetrics(tickets);
  const openTickets = tickets.filter((ticket) => openStatuses.has(ticket.status));
  const attentionSummary = buildAttentionSummary(tickets);
  const attentionItems = attentionSummary.items;
  const attentionTicketCount = attentionSummary.totalCount;
  const unassignedOpenCount = openTickets.filter((ticket) => !ticket.assigneeId).length;
  const canCreateTicket = session.role === "owner" || session.role === "manager";
  const syncEvent = getSearchParamValue(searchParams, "sync");
  const syncScanned = Number(getSearchParamValue(searchParams, "scanned") ?? 0);
  const manualTicketCreated = getSearchParamValue(searchParams, "manual_ticket") === "created";
  const manualTicketError = getSearchParamValue(searchParams, "error") === "manual_ticket";

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      {/* ── Header row ───────────────────────── */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#607287]">
            Ticket yönetimi
          </p>
          <h1 className="mt-1 text-[2rem] font-semibold tracking-tight text-[#102038]">
            Destek operasyonu
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a href={buildReportQuery(filters, "xlsx")} className={secondaryButtonClass}>
            <Download className="h-4 w-4" /> Excel
          </a>
          <a href={buildReportQuery(filters, "pdf")} className={secondaryButtonClass}>
            <Download className="h-4 w-4" /> PDF
          </a>
        </div>
      </section>

      {/* ── Metrics ──────────────────────────── */}
      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <MetricTile label="Toplam ticket" value={metrics.totalTickets} hint="Tüm kayıtlar" />
        <MetricTile label="Açık ticket" value={metrics.openTickets} hint="Aktif operasyon" />
        <MetricTile label="Kapanan ticket" value={metrics.closedTickets} hint="Tamamlananlar" />
        <MetricTile label="Atama bekleyen" value={unassignedOpenCount} hint="Dağıtım kuyruğu" />
        <MetricTile
          label="İlk yanıt ort."
          value={formatDurationMinutes(metrics.averageFirstResponseMinutes)}
          hint="İlk temas süresi"
        />
        <MetricTile
          label="Çözüm ort."
          value={formatDurationMinutes(metrics.averageResolutionMinutes)}
          hint="Kapanış ortalaması"
        />
      </section>

      {!hasDatabase ? (
        <section className="rounded-xl border border-amber-300/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Mock mode aktif: kayıtlar kalıcı değil.</p>
          <p className="mt-1 text-xs leading-5">
            DATABASE_URL tanımlanmadığı için uygulama geçici store ile çalışıyor.
          </p>
        </section>
      ) : null}

      {syncEvent === "done" ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Mail senkronizasyonu tamamlandı. {syncScanned} ileti tarandı.
        </section>
      ) : null}
      {manualTicketCreated ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Manuel ticket başarıyla oluşturuldu.
        </section>
      ) : null}

      {/* ── Filters ──────────────────────────── */}
      <Surface className={panelClass}>
        <div className="flex items-center gap-2.5 mb-4">
          <Filter className="h-4 w-4 text-[#133961]" />
          <h2 className="text-lg font-semibold tracking-tight text-[#102038]">Filtreler</h2>
        </div>
        <form className="grid gap-3 xl:grid-cols-[1.3fr_0.95fr_0.95fr_0.95fr_1.1fr_auto]" method="GET">
          <input
            name="query"
            placeholder="Ticket kodu, konu, müşteri veya domain"
            defaultValue={filters.query ?? ""}
          />
          <select name="tenantId" defaultValue={filters.tenantId ?? ""}>
            <option value="">Tüm tenantlar</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status ?? "all"}>
            <option value="all">Tüm durumlar</option>
            <option value="new">Yeni</option>
            <option value="open">Açık</option>
            <option value="waiting_customer">Müşteri yanıtı bekleniyor</option>
            <option value="resolved">Çözüldü</option>
            <option value="closed">Kapatıldı</option>
          </select>
          <select name="priority" defaultValue={filters.priority ?? "all"}>
            <option value="all">Tüm öncelikler</option>
            <option value="low">Düşük</option>
            <option value="normal">Normal</option>
            <option value="high">Yüksek</option>
            <option value="critical">Kritik</option>
          </select>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <input name="from" type="date" defaultValue={filters.from ?? ""} />
            <input name="to" type="date" defaultValue={filters.to ?? ""} />
          </div>
          <button className={`w-full ${primaryButtonClass}`}>Uygula</button>
        </form>
      </Surface>

      {/* ── Manual ticket creation (owner/manager only) ── */}
      {canCreateTicket ? (
        <Surface className={panelClass}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 marker:content-none [&::-webkit-details-marker]:hidden">
              <PenLine className="h-4 w-4 text-[#133961]" />
              <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
                Ticket oluştur
              </h2>
            </summary>
            <div className="mt-4">
              <p className="mb-4 text-xs text-[#607287]">
                Tüm müşteri alanları zorunludur. Oluşturan kişi otomatik kaydedilir.
              </p>
              {manualTicketError ? (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900">
                  Ticket oluşturulamadı. Tüm alanları doldurun.
                </div>
              ) : null}
              <form action={createManualTicketAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <select name="tenantId" required>
                  <option value="">Tenant seçin</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input name="customerName" placeholder="Müşteri adı soyadı" required />
                <input name="customerEmail" type="email" placeholder="Müşteri e-posta" required />
                <input name="customerPhone" placeholder="Müşteri telefon" required />
                <input name="subject" placeholder="Konu" required className="sm:col-span-2 lg:col-span-2" />
                <select name="priority" defaultValue="normal">
                  <option value="low">Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik</option>
                </select>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Detaylı açıklama"
                  required
                  className="resize-none sm:col-span-2 lg:col-span-3"
                />
                <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
                  <ImagePlus className="h-4 w-4 shrink-0 text-[#607287]" />
                  <label className="text-xs text-[#607287]">Ekran görüntüsü</label>
                  <input
                    name="screenshot"
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-[#607287] file:mr-2 file:rounded-lg file:border-0 file:bg-[rgba(19,57,97,0.08)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#102038] hover:file:bg-[rgba(19,57,97,0.14)]"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <SubmitButton pendingText="Oluşturuluyor..." className={`w-full ${primaryButtonClass}`}>
                    Ticket oluştur
                  </SubmitButton>
                </div>
              </form>
            </div>
          </details>
        </Surface>
      ) : null}

      {/* ── Ticket table ─────────────────────── */}
      <section>
        <Surface className={`min-w-0 overflow-hidden p-0 ${panelClass}`}>
          <div className="flex items-center justify-between gap-4 border-b border-[rgba(17,35,60,0.08)] px-5 py-3.5 sm:px-6">
            <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
              Ticket listesi
            </h2>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(17,35,60,0.08)] bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#5f738c]">
              <MailOpen className="h-3.5 w-3.5 text-[#133961]" />
              {tickets.length} kayıt
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[rgba(19,57,97,0.04)] text-[0.68rem] uppercase tracking-[0.18em] text-[#607287]">
                <tr>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Müşteri</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Atanan</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Öncelik</th>
                  <th className="px-4 py-3">İlk yanıt</th>
                  <th className="px-4 py-3">Geliş</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const firstResponseMinutes = ticket.firstResponseAt
                    ? Math.round(
                        (ticket.firstResponseAt.getTime() - ticket.firstReceivedAt.getTime()) /
                          60000,
                      )
                    : null;

                  return (
                    <tr
                      key={ticket.id}
                      className="border-t border-[rgba(17,35,60,0.08)] transition hover:bg-[rgba(19,57,97,0.03)]"
                    >
                      <td className="px-4 py-3.5 align-top">
                        <Link href={`/ticket/admin/tickets/${ticket.id}`} className="group block">
                          <p className="text-sm font-semibold text-[#102038] transition group-hover:text-[#174d81]">
                            {ticket.ticketCode}
                          </p>
                          <p className="mt-0.5 max-w-[16rem] text-xs leading-5 text-[#5f738c]">
                            {ticket.subject}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 align-top text-xs text-[#324861]">
                        <p className="font-medium">{ticket.customerName ?? "İsimsiz"}</p>
                        <p className="mt-0.5 break-all text-[#607287]">{ticket.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3.5 align-top text-xs text-[#324861]">
                        {ticket.tenantName}
                      </td>
                      <td className="px-4 py-3.5 align-top text-xs text-[#607287]">
                        {ticket.assigneeName ?? "Atanmadı"}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <StatusBadge value={ticket.status} />
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <PriorityBadge value={ticket.priority} />
                      </td>
                      <td className="px-4 py-3.5 align-top text-xs text-[#324861]">
                        {formatDurationMinutes(firstResponseMinutes)}
                      </td>
                      <td className="px-4 py-3.5 align-top text-xs whitespace-nowrap text-[#607287]">
                        {formatDateTime(ticket.firstReceivedAt)}
                      </td>
                      <td className="px-4 py-3.5 align-top text-right">
                        <Link
                          href={`/ticket/admin/tickets/${ticket.id}`}
                          className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg border border-[rgba(17,35,60,0.08)] bg-white/84 px-3 text-xs font-semibold text-[#102038] transition hover:bg-white"
                        >
                          Düzenle
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!tickets.length ? (
              <div className="px-6 py-10 text-center text-sm text-[#607287]">
                Seçili filtreler için ticket bulunamadı.
              </div>
            ) : null}
          </div>
        </Surface>
      </section>

      {/* ── Tenant list ──────────────────────── */}
      <Surface className={softPanelClass}>
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#607287]">
          Tenant listesi
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="rounded-xl border border-[rgba(17,35,60,0.06)] bg-white/60 px-3.5 py-2.5"
            >
              <p className="text-sm font-semibold text-[#102038]">{tenant.name}</p>
              <p className="mt-0.5 text-xs text-[#607287]">
                {tenant.domains.join(", ") || "Domain yok"}
              </p>
            </div>
          ))}
        </div>
      </Surface>

      {/* ── Öncelikli aksiyonlar + Son işlemler (bottom) ── */}
      <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <Surface className={panelClass}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-[#37c2e8]" />
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
                  Öncelikli aksiyonlar
                </h2>
                <p className="mt-0.5 text-xs text-[#607287]">
                  {attentionTicketCount} ticket için aksiyon gerekiyor.
                </p>
              </div>
            </div>
            <span className={pillClass}>{attentionItems.length} görünüm</span>
          </div>

          <div className="space-y-2">
            {attentionItems.length ? (
              attentionItems.map((item) => (
                <Link
                  key={item.ticketId}
                  href={`/ticket/admin/tickets/${item.ticketId}`}
                  className="block rounded-xl border border-[rgba(17,35,60,0.08)] bg-white/70 px-3.5 py-3 transition hover:border-[rgba(55,194,232,0.2)] hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#102038]">
                        {item.ticketCode} · {item.reason}
                      </p>
                      <p className="mt-0.5 text-xs text-[#324861]">{item.subject}</p>
                      <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-[#607287]">
                        {item.tenantName} · {item.detail}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge value={item.status} />
                      <PriorityBadge value={item.priority} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[rgba(17,35,60,0.14)] bg-white/70 px-4 py-5 text-xs text-[#607287]">
                Acil aksiyon gerektiren ticket yok.
              </div>
            )}
          </div>
        </Surface>

        <Surface className={panelClass}>
          <div className="flex items-start gap-2.5 mb-4">
            <Clock3 className="mt-0.5 h-4 w-4 text-[#37c2e8]" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
                Son işlemler
              </h2>
              <p className="mt-0.5 text-xs text-[#607287]">
                Kronolojik hareket kayıtları.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {auditLogs.length ? (
              auditLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-[rgba(17,35,60,0.08)] bg-white/70 px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#102038]">{entry.summary}</p>
                    <span className={pillClass}>{entry.action}</span>
                  </div>
                  <p className="mt-1 text-[0.65rem] text-[#607287]">
                    {entry.adminEmail} · {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[rgba(17,35,60,0.14)] bg-white/70 px-4 py-5 text-xs text-[#607287]">
                Henüz kaydedilmiş işlem yok.
              </div>
            )}
          </div>
        </Surface>
      </section>
    </main>
  );
}
