import Link from "next/link";
import {
  AlertTriangle,
  Clock3,
  Download,
  Filter,
  MailOpen,
  Plus,
} from "lucide-react";

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
    <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.18)] bg-[linear-gradient(135deg,#071526_0%,#0f2745_56%,#173c67_100%)] px-5 py-6 text-white shadow-[0_28px_80px_rgba(7,21,38,0.22)] sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 right-0 w-[28rem] bg-[radial-gradient(circle_at_center,rgba(55,194,232,0.16),transparent_62%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.04))]" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8de7ff]">
              Ticket yönetimi
            </div>
            <h1 className="mt-4 text-[2.25rem] font-semibold tracking-tight text-white sm:text-[2.65rem]">
              Destek operasyonu
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#c7d8e8] sm:text-[0.95rem]">
              Uptexx ana sitedeki lacivert kurumsal dil ile aynı hat üzerinde, daha sıkı
              ve daha okunabilir bir ticket yönetim yüzeyi.
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
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
        <section className="rounded-[22px] border border-amber-300/80 bg-[linear-gradient(135deg,rgba(255,247,219,0.96)_0%,rgba(255,251,237,0.98)_100%)] px-4 py-3.5 text-sm text-amber-950 shadow-[0_14px_24px_rgba(163,120,24,0.08)]">
          <p className="font-semibold">Mock mode aktif: kayitlar kalici degil.</p>
          <p className="mt-1 leading-6">
            `DATABASE_URL` tanimlanmadigi icin uygulama gecici store ile calisiyor.
            TiDB baglantisini kurup `npm run db:init` calistirdiginizda ticket, tenant ve ekip kayitlari kalici olarak veritabaninda tutulur.
          </p>
        </section>
      ) : null}

      {syncEvent === "done" || tenantUpdated || agentUpdated ? (
        <section className="space-y-3">
          {syncEvent === "done" ? (
            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50/95 px-4 py-3.5 text-sm text-emerald-950">
              <p className="font-semibold">Mail senkronizasyonu tamamlandı.</p>
              <p className="mt-1 leading-6">
                Inbox içinde {syncScanned} ileti kontrol edildi ve dashboard verileri yenilendi.
              </p>
            </div>
          ) : null}
          {tenantUpdated ? (
            <div className="rounded-[22px] border border-cyan-200 bg-cyan-50/95 px-4 py-3.5 text-sm text-cyan-950">
              Tenant durumu güncellendi.
            </div>
          ) : null}
          {agentUpdated ? (
            <div className="rounded-[22px] border border-cyan-200 bg-cyan-50/95 px-4 py-3.5 text-sm text-cyan-950">
              Ekip üyesi durumu güncellendi.
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <Surface className={panelClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d9f6ff_0%,#edf6fb_100%)] text-[#133961]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#102038] sm:text-2xl">
                  Öncelikli aksiyonlar
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#607287]">
                  Mevcut filtrelerde {attentionTicketCount} ticket için operasyon aksiyonu gerekiyor.
                </p>
              </div>
            </div>
            <div className={pillClass}>
              {attentionItems.length} görünüm
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {attentionItems.length ? (
              attentionItems.map((item) => (
                <Link
                  key={item.ticketId}
                  href={`/ticket/admin/tickets/${item.ticketId}`}
                  className="block rounded-[22px] border border-[rgba(17,35,60,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(244,248,251,0.9)_100%)] px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-[rgba(55,194,232,0.2)] hover:shadow-[0_12px_26px_rgba(8,25,47,0.08)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#102038]">
                        {item.ticketCode} · {item.reason}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#324861]">{item.subject}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#607287]">
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
              <div className="rounded-[22px] border border-dashed border-[rgba(17,35,60,0.14)] bg-white/70 px-4 py-6 text-sm leading-6 text-[#607287]">
                Seçili filtrelerde acil aksiyon gerektiren ticket görünmüyor.
              </div>
            )}
          </div>
        </Surface>

        <Surface className={panelClass}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ddeeff_0%,#f1f7fc_100%)] text-[#133961]">
              <Clock3 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#102038] sm:text-2xl">
                Son işlemler
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#607287]">
                Tenant, ekip ve ticket hareketleri burada kronolojik görünür.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {auditLogs.length ? (
              auditLogs.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[22px] border border-[rgba(17,35,60,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(244,248,251,0.92)_100%)] px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#102038]">{entry.summary}</p>
                    <span className={pillClass}>
                      {entry.action}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[#607287]">
                    {entry.adminEmail} · {formatDateTime(entry.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-[rgba(17,35,60,0.14)] bg-white/70 px-4 py-6 text-sm leading-6 text-[#607287]">
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
              className={`group ${panelClass} rounded-[26px]`}
              open={tenantCreated || tenantCreateError}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d8f2fb_0%,#eef6fb_100%)] text-[#133961]">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#607287]">
                    Hızlı işlem
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#102038]">
                      Yeni tenant ekle
                    </h2>
                  </div>
                </div>
                <span className={primaryButtonClass}>
                  <Plus className="h-4 w-4" /> Formu aç
                </span>
              </summary>

              <div className="border-t border-[rgba(17,35,60,0.08)] px-5 pb-5 pt-4 sm:px-6">
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

                <form action={createTenantAction} className="grid gap-3 sm:grid-cols-2">
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
                    className="resize-none sm:col-span-2"
                  />
                  <SubmitButton
                    pendingText="Oluşturuluyor..."
                    className={`w-full sm:col-span-2 ${primaryButtonClass}`}
                  >
                    Tenant oluştur
                  </SubmitButton>
                </form>
              </div>
            </details>
          ) : null}

          {canManageTeam ? (
            <details
              className={`group ${panelClass} rounded-[26px]`}
              open={agentCreated || agentCreateError}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d8f2fb_0%,#eef6fb_100%)] text-[#133961]">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#607287]">
                    Hızlı işlem
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#102038]">
                      Yeni ekip üyesi ekle
                    </h2>
                  </div>
                </div>
                <span className={primaryButtonClass}>
                  <Plus className="h-4 w-4" /> Formu aç
                </span>
              </summary>

              <div className="border-t border-[rgba(17,35,60,0.08)] px-5 pb-5 pt-4 sm:px-6">
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

                <form action={createSupportAgentAction} className="grid gap-3 sm:grid-cols-2">
                  <input name="name" placeholder="Ad soyad" required />
                  <input name="email" type="email" placeholder="ekip@uptexx.com" required />
                  <select name="role" defaultValue="agent" className="sm:col-span-2">
                    <option value="agent">Destek Uzmanı</option>
                    <option value="manager">Yönetici</option>
                    <option value="owner">Sahip</option>
                  </select>
                  <SubmitButton
                    pendingText="Oluşturuluyor..."
                    className={`w-full sm:col-span-2 ${primaryButtonClass}`}
                  >
                    Ekip üyesi ekle
                  </SubmitButton>
                </form>
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      <Surface className={panelClass}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d9f2fb_0%,#eef6fb_100%)] text-[#133961]">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#102038] sm:text-2xl">
                Filtreler
              </h2>
              <p className="mt-1 text-sm text-[#607287]">
                Listeyi tenant, durum, öncelik ve tarih aralığına göre daraltın.
              </p>
            </div>
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
        </div>
      </Surface>

      <section>
        <Surface className={`min-w-0 overflow-hidden p-0 ${panelClass}`}>
          <div className="flex flex-col gap-4 border-b border-[rgba(17,35,60,0.08)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#607287]">
                Ticket listesi
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#102038] sm:text-[2rem]">
                Filtrelenmiş görünüm
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(17,35,60,0.08)] bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#5f738c]">
              <MailOpen className="h-4 w-4 text-[#133961]" />
              {tickets.length} kayıt
            </div>
          </div>

          <div className="overflow-x-auto xl:overflow-visible">
            <table className="min-w-full text-left">
              <thead className="bg-[rgba(19,57,97,0.04)] text-[0.68rem] uppercase tracking-[0.18em] text-[#607287]">
                <tr>
                  <th className="px-4 py-3.5">Ticket</th>
                  <th className="px-4 py-3.5">Müşteri</th>
                  <th className="px-4 py-3.5">Tenant</th>
                  <th className="px-4 py-3.5">Atanan</th>
                  <th className="px-4 py-3.5">Durum</th>
                  <th className="px-4 py-3.5">Öncelik</th>
                  <th className="px-4 py-3.5">İlk yanıt</th>
                  <th className="px-4 py-3.5">Geliş</th>
                  <th className="px-4 py-3.5 text-right">İşlem</th>
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
                      <td className="px-4 py-4 align-top">
                        <Link href={`/ticket/admin/tickets/${ticket.id}`} className="group block">
                          <p className="font-semibold text-[#102038] transition group-hover:text-[#174d81]">
                            {ticket.ticketCode}
                          </p>
                          <p className="mt-1 max-w-[18rem] text-sm leading-6 text-[#5f738c]">
                            {ticket.subject}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-[#324861]">
                        <p className="font-medium">{ticket.customerName ?? "İsimsiz kayıt"}</p>
                        <p className="mt-1 break-all text-[#607287]">{ticket.customerEmail}</p>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-[#324861]">
                        {ticket.tenantName}
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-[#607287]">
                        {ticket.assigneeName ?? "Atanmadı"}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <StatusBadge value={ticket.status} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <PriorityBadge value={ticket.priority} />
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-[#324861]">
                        {formatDurationMinutes(firstResponseMinutes)}
                      </td>
                      <td className="px-4 py-4 align-top text-sm whitespace-nowrap text-[#607287]">
                        {formatDateTime(ticket.firstReceivedAt)}
                      </td>
                      <td className="px-4 py-4 align-top text-right">
                        <Link
                          href={`/ticket/admin/tickets/${ticket.id}`}
                          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-full border border-[rgba(17,35,60,0.08)] bg-white/84 px-4 text-sm font-semibold text-[#102038] transition hover:bg-white"
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
              <div className="px-6 py-12 text-center text-[#607287]">
                Seçili filtreler için ticket bulunamadı.
              </div>
            ) : null}
          </div>
        </Surface>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="min-w-0 space-y-5">
          <Surface className={`overflow-hidden ${softPanelClass}`}>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#607287]">
              Tenant listesi
            </p>
            <div className="mt-4 space-y-2.5">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="min-w-0 rounded-[20px] border border-[rgba(17,35,60,0.08)] bg-white/78 px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#102038]">{tenant.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#607287]">
                        {getActiveLabel(tenant.isActive)}
                      </p>
                    </div>
                    {canManageTenants ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/ticket/admin/tenants/${tenant.id}`}
                          className="rounded-full border border-[rgba(17,35,60,0.08)] bg-white px-3 py-1.5 text-xs font-semibold text-[#102038] transition hover:bg-[#f4f9fc]"
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
                          <button className="rounded-full border border-[rgba(17,35,60,0.08)] bg-white px-3 py-1.5 text-xs font-semibold text-[#102038] transition hover:bg-[#f4f9fc]">
                            {tenant.isActive ? "Pasife çek" : "Aktif et"}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-1 break-all text-sm leading-6 text-[#607287]">
                    {tenant.domains.join(", ") || "Henüz domain tanımlı değil"}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <div className="min-w-0 space-y-5">
          <Surface className={`overflow-hidden ${softPanelClass}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d9f2fb_0%,#eef6fb_100%)] text-[#133961]">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-[#102038] sm:text-2xl">
                  Ekip üyeleri
                </h2>
                <p className="mt-1 text-sm text-[#607287]">
                  Ticketlara atanabilecek iç ekip kullanıcılarını yönetin.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="min-w-0 rounded-[20px] border border-[rgba(17,35,60,0.08)] bg-white/78 px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#102038]">{agent.name}</p>
                      <p className="mt-1 break-all text-sm text-[#607287]">{agent.email}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#607287]">
                        <span>{getRoleLabel(agent.role)}</span>
                        <span>{getActiveLabel(agent.isActive)}</span>
                        {agent.invitePending ? <span>Davet bekliyor</span> : null}
                      </div>
                    </div>
                    {canManageTeam ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/ticket/admin/team/${agent.id}`}
                          className="rounded-full border border-[rgba(17,35,60,0.08)] bg-white px-3 py-1.5 text-xs font-semibold text-[#102038] transition hover:bg-[#f4f9fc]"
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
                          <button className="rounded-full border border-[rgba(17,35,60,0.08)] bg-white px-3 py-1.5 text-xs font-semibold text-[#102038] transition hover:bg-[#f4f9fc]">
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
