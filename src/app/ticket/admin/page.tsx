import Link from "next/link";
import { AlertTriangle, Clock3, Download, Filter, MailOpen, Plus } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { MetricTile, PriorityBadge, StatusBadge, Surface } from "@/components/ticket-ui";
import { requireAdminSession } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { getActiveLabel, getRoleLabel } from "@/lib/labels";
import { calculateMetrics } from "@/lib/reports";
import { listAuditLogs, listSupportAgents, listTenants, listTickets } from "@/lib/data";
import type { TicketFilters, TicketListItem } from "@/lib/types";
import { formatDateTime, formatDurationMinutes } from "@/lib/utils";

import {
  createSupportAgentAction,
  createTenantAction,
  toggleSupportAgentStateAction,
  toggleTenantStateAction,
} from "./actions";

export const dynamic = "force-dynamic";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2f3a49] px-4 text-sm font-semibold text-white transition hover:bg-[#24303e]";
const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] px-4 text-sm font-semibold text-[#2a2e36] transition hover:bg-[#efe5d7]";

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
  const [tenants, tickets, agents, auditLogs] = await Promise.all([
    listTenants(),
    listTickets(filters),
    listSupportAgents(),
    listAuditLogs(8),
  ]);
  const metrics = calculateMetrics(tickets);
  const openTickets = tickets.filter((ticket) => openStatuses.has(ticket.status));
  const attentionSummary = buildAttentionSummary(tickets);
  const attentionItems = attentionSummary.items;
  const attentionTicketCount = attentionSummary.totalCount;
  const unassignedOpenCount = openTickets.filter((ticket) => !ticket.assigneeId).length;
  const canManageTenants = session.role === "owner" || session.role === "manager";
  const canManageTeam = session.role === "owner";
  const tenantEvent = getSearchParamValue(searchParams, "tenant");
  const agentEvent = getSearchParamValue(searchParams, "agent");
  const syncEvent = getSearchParamValue(searchParams, "sync");
  const syncScanned = Number(getSearchParamValue(searchParams, "scanned") ?? 0);
  const pageError = getSearchParamValue(searchParams, "error");
  const tenantCreated = tenantEvent === "created";
  const agentCreated = agentEvent === "created";
  const tenantUpdated = tenantEvent === "updated";
  const agentUpdated = agentEvent === "updated";
  const tenantCreateError = pageError === "tenant";
  const agentCreateError = pageError === "agent";

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-6 py-8 lg:px-10">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
            Ticket yönetimi
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#2a2e36]">
            Destek operasyonu
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b655d]">
            Gelen mailleri izleyin, tenant bazlı filtreleyin ve müşterilere aylık
            rapor hazırlayın.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={buildReportQuery(filters, "xlsx")} className={secondaryButtonClass}>
            <Download className="h-4 w-4" /> Excel export
          </a>
          <a href={buildReportQuery(filters, "pdf")} className={secondaryButtonClass}>
            <Download className="h-4 w-4" /> PDF özet
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricTile label="Toplam ticket" value={metrics.totalTickets} />
        <MetricTile label="Açık ticket" value={metrics.openTickets} />
        <MetricTile label="Kapanan ticket" value={metrics.closedTickets} />
        <MetricTile label="Atama bekleyen" value={unassignedOpenCount} />
        <MetricTile
          label="İlk yanıt ort."
          value={formatDurationMinutes(metrics.averageFirstResponseMinutes)}
        />
        <MetricTile
          label="Çözüm ort."
          value={formatDurationMinutes(metrics.averageResolutionMinutes)}
        />
      </section>

      {!hasDatabase ? (
        <section className="rounded-[24px] border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Mock mode aktif: kayitlar kalici degil.</p>
          <p className="mt-1 leading-7">
            `DATABASE_URL` tanimlanmadigi icin uygulama gecici store ile calisiyor.
            TiDB baglantisini kurup `npm run db:init` calistirdiginizda ticket, tenant ve ekip kayitlari kalici olarak veritabaninda tutulur.
          </p>
        </section>
      ) : null}

      {syncEvent === "done" || tenantUpdated || agentUpdated ? (
        <section className="space-y-3">
          {syncEvent === "done" ? (
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
              <p className="font-semibold">Mail senkronizasyonu tamamlandı.</p>
              <p className="mt-1 leading-7">
                Inbox içinde {syncScanned} ileti kontrol edildi ve dashboard verileri yenilendi.
              </p>
            </div>
          ) : null}
          {tenantUpdated ? (
            <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm text-cyan-950">
              Tenant durumu güncellendi.
            </div>
          ) : null}
          {agentUpdated ? (
            <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 px-5 py-4 text-sm text-cyan-950">
              Ekip üyesi durumu güncellendi.
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-[#7d6546]" />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#2a2e36]">
                  Öncelikli aksiyonlar
                </h2>
                <p className="mt-1 text-sm leading-7 text-[#6b655d]">
                  Mevcut filtrelerde {attentionTicketCount} ticket için operasyon aksiyonu gerekiyor.
                </p>
              </div>
            </div>
            <div className="rounded-full bg-[#efe5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d6546]">
              {attentionItems.length} görünüm
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {attentionItems.length ? (
              attentionItems.map((item) => (
                <Link
                  key={item.ticketId}
                  href={`/ticket/admin/tickets/${item.ticketId}`}
                  className="block rounded-[24px] border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-5 py-4 transition hover:bg-[#eadfce]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#2a2e36]">
                        {item.ticketCode} · {item.reason}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-[#3f4652]">{item.subject}</p>
                      <p className="mt-1 text-sm text-[#6b655d]">
                        {item.tenantName} · {item.detail}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={item.status} />
                      <PriorityBadge value={item.priority} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[rgba(42,46,54,0.14)] bg-[#fffaf2] px-5 py-8 text-sm leading-7 text-[#6b655d]">
                Seçili filtrelerde acil aksiyon gerektiren ticket görünmüyor.
              </div>
            )}
          </div>
        </Surface>

        <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-1 h-5 w-5 text-[#7d6546]" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#2a2e36]">
                Son işlemler
              </h2>
              <p className="mt-1 text-sm leading-7 text-[#6b655d]">
                Tenant, ekip ve ticket hareketleri burada kronolojik görünür.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {auditLogs.length ? (
              auditLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[24px] border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-5 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#2a2e36]">{entry.summary}</p>
                    <span className="rounded-full bg-[#fffaf2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6d4b]">
                      {entry.action}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[#6b655d]">
                    {entry.adminEmail} · {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[rgba(42,46,54,0.14)] bg-[#fffaf2] px-5 py-8 text-sm leading-7 text-[#6b655d]">
                Henüz kaydedilmiş işlem bulunmuyor.
              </div>
            )}
          </div>
        </Surface>
      </section>

      {canManageTenants || canManageTeam ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {canManageTenants ? (
            <details
              className="group rounded-[28px] border border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]"
              open={tenantCreated || tenantCreateError}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5 marker:content-none">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
                    Hızlı işlem
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#2a2e36]">
                    Yeni tenant ekle
                  </h2>
                </div>
                <span className={primaryButtonClass}>
                  <Plus className="h-4 w-4" /> Formu aç
                </span>
              </summary>

              <div className="border-t border-[rgba(42,46,54,0.08)] px-6 pb-6 pt-5">
                {tenantCreated ? (
                  <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                    Tenant oluşturuldu.
                  </div>
                ) : null}
                {tenantCreateError ? (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
                    Tenant oluşturulamadı. Gerekli alanları kontrol edin.
                  </div>
                ) : null}

                <form action={createTenantAction} className="grid gap-4">
                  <input name="name" placeholder="Müşteri şirket adı" required />
                  <input
                    name="supportAddress"
                    placeholder="destek@uptexx.com"
                    defaultValue="destek@uptexx.com"
                    required
                  />
                  <textarea
                    name="domains"
                    rows={3}
                    placeholder="acme.com.tr, acmelojistik.com"
                    className="resize-none"
                  />
                  <SubmitButton
                    pendingText="Oluşturuluyor..."
                    className={`w-full ${primaryButtonClass}`}
                  >
                    Tenant oluştur
                  </SubmitButton>
                </form>
              </div>
            </details>
          ) : null}

          {canManageTeam ? (
            <details
              className="group rounded-[28px] border border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]"
              open={agentCreated || agentCreateError}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5 marker:content-none">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
                    Hızlı işlem
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#2a2e36]">
                    Yeni ekip üyesi ekle
                  </h2>
                </div>
                <span className={primaryButtonClass}>
                  <Plus className="h-4 w-4" /> Formu aç
                </span>
              </summary>

              <div className="border-t border-[rgba(42,46,54,0.08)] px-6 pb-6 pt-5">
                {agentCreated ? (
                  <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                    Ekip üyesi oluşturuldu ve davet akışı başlatıldı.
                  </div>
                ) : null}
                {agentCreateError ? (
                  <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
                    Ekip üyesi oluşturulamadı. Gerekli alanları kontrol edin.
                  </div>
                ) : null}

                <form action={createSupportAgentAction} className="grid gap-4">
                  <input name="name" placeholder="Ad soyad" required />
                  <input name="email" type="email" placeholder="ekip@uptexx.com" required />
                  <select name="role" defaultValue="agent">
                    <option value="agent">Destek Uzmanı</option>
                    <option value="manager">Yönetici</option>
                    <option value="owner">Sahip</option>
                  </select>
                  <SubmitButton
                    pendingText="Oluşturuluyor..."
                    className={`w-full ${primaryButtonClass}`}
                  >
                    Ekip üyesi ekle
                  </SubmitButton>
                </form>
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-[#7d6546]" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#2a2e36]">
                Filtreler
              </h2>
              <p className="mt-1 text-sm text-[#6b655d]">
                Listeyi tenant, durum, öncelik ve tarih aralığına göre daraltın.
              </p>
            </div>
          </div>

          <form className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]" method="GET">
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
            <button className={primaryButtonClass}>Uygula</button>
          </form>
        </div>
      </Surface>

      <section>
        <Surface className="min-w-0 overflow-hidden border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] p-0 shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
          <div className="flex flex-col gap-4 border-b border-[rgba(42,46,54,0.08)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
                Ticket listesi
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#2a2e36]">
                Filtrelenmiş görünüm
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#efe5d7] px-3 py-2 text-sm font-semibold text-[#6b655d]">
              <MailOpen className="h-4 w-4 text-[#7d6546]" />
              {tickets.length} kayıt
            </div>
          </div>

          <div className="overflow-x-auto xl:overflow-visible">
            <table className="min-w-full text-left">
              <thead className="bg-[#f2eadf] text-xs uppercase tracking-[0.18em] text-[#7a746c]">
                <tr>
                  <th className="px-4 py-4">Ticket</th>
                  <th className="px-4 py-4">Müşteri</th>
                  <th className="px-4 py-4">Tenant</th>
                  <th className="px-4 py-4">Atanan</th>
                  <th className="px-4 py-4">Durum</th>
                  <th className="px-4 py-4">Öncelik</th>
                  <th className="px-4 py-4">İlk yanıt</th>
                  <th className="px-4 py-4">Geliş</th>
                  <th className="px-4 py-4 text-right">İşlem</th>
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
                      className="border-t border-[rgba(42,46,54,0.08)] transition hover:bg-[#f6efe6]"
                    >
                      <td className="px-4 py-5 align-top">
                        <Link href={`/ticket/admin/tickets/${ticket.id}`} className="group block">
                          <p className="font-semibold text-[#2a2e36] transition group-hover:text-[#7d6546]">
                            {ticket.ticketCode}
                          </p>
                          <p className="mt-1 max-w-[18rem] text-sm leading-6 text-[#5f6774]">
                            {ticket.subject}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-5 align-top text-sm text-[#3f4652]">
                        <p className="font-medium">{ticket.customerName ?? "İsimsiz kayıt"}</p>
                        <p className="mt-1 break-all text-[#6b655d]">{ticket.customerEmail}</p>
                      </td>
                      <td className="px-4 py-5 align-top text-sm text-[#3f4652]">
                        {ticket.tenantName}
                      </td>
                      <td className="px-4 py-5 align-top text-sm text-[#6b655d]">
                        {ticket.assigneeName ?? "Atanmadı"}
                      </td>
                      <td className="px-4 py-5 align-top">
                        <StatusBadge value={ticket.status} />
                      </td>
                      <td className="px-4 py-5 align-top">
                        <PriorityBadge value={ticket.priority} />
                      </td>
                      <td className="px-4 py-5 align-top text-sm text-[#3f4652]">
                        {formatDurationMinutes(firstResponseMinutes)}
                      </td>
                      <td className="px-4 py-5 align-top text-sm text-[#6b655d] whitespace-nowrap">
                        {formatDateTime(ticket.firstReceivedAt)}
                      </td>
                      <td className="px-4 py-5 align-top text-right">
                        <Link
                          href={`/ticket/admin/tickets/${ticket.id}`}
                          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-4 text-sm font-semibold text-[#2a2e36] transition hover:bg-[#eadfce]"
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
              <div className="px-6 py-16 text-center text-[#6b655d]">
                Seçili filtreler için ticket bulunamadı.
              </div>
            ) : null}
          </div>
        </Surface>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <Surface className="overflow-hidden border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
              Tenant listesi
            </p>
            <div className="mt-5 space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="min-w-0 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#2a2e36]">{tenant.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6d4b]">
                        {getActiveLabel(tenant.isActive)}
                      </p>
                    </div>
                    {canManageTenants ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/ticket/admin/tenants/${tenant.id}`}
                          className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-[#2a2e36] transition hover:bg-[#eadfce]"
                        >
                          Düzenle
                        </Link>
                        <form action={toggleTenantStateAction}>
                          <input type="hidden" name="tenantId" value={tenant.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={tenant.isActive ? "false" : "true"}
                          />
                          <button className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-[#2a2e36] transition hover:bg-[#eadfce]">
                            {tenant.isActive ? "Pasife çek" : "Aktif et"}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-1 break-all text-sm leading-7 text-[#6b655d]">
                    {tenant.domains.join(", ") || "Henüz domain tanımlı değil"}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="min-w-0 space-y-6">
          <Surface className="overflow-hidden border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-[#7d6546]" />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#2a2e36]">
                  Ekip üyeleri
                </h2>
                <p className="mt-1 text-sm text-[#6b655d]">
                  Ticketlara atanabilecek iç ekip kullanıcılarını yönetin.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="min-w-0 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#2a2e36]">{agent.name}</p>
                      <p className="mt-1 break-all text-sm text-[#6b655d]">{agent.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6d4b]">
                        <span>{getRoleLabel(agent.role)}</span>
                        <span>{getActiveLabel(agent.isActive)}</span>
                        {agent.invitePending ? <span>Davet bekliyor</span> : null}
                      </div>
                    </div>
                    {canManageTeam ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/ticket/admin/team/${agent.id}`}
                          className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-[#2a2e36] transition hover:bg-[#eadfce]"
                        >
                          Düzenle
                        </Link>
                        <form action={toggleSupportAgentStateAction}>
                          <input type="hidden" name="agentId" value={agent.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={agent.isActive ? "false" : "true"}
                          />
                          <button className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-3 py-1.5 text-xs font-semibold text-[#2a2e36] transition hover:bg-[#eadfce]">
                            {agent.isActive ? "Pasife çek" : "Aktif et"}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>
    </main>
  );
}
