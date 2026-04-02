import Link from "next/link";
import { Download, Filter, MailOpen, Plus } from "lucide-react";

import { MetricTile, PriorityBadge, StatusBadge, Surface } from "@/components/ticket-ui";
import { calculateMetrics } from "@/lib/reports";
import { listTenants, listTickets } from "@/lib/data";
import type { TicketFilters } from "@/lib/types";
import { formatDateTime, formatDurationMinutes } from "@/lib/utils";

import { createTenantAction } from "./actions";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#08192f] px-4 text-sm font-semibold text-white transition hover:bg-[#0d2342]";
const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[color:var(--line)] bg-white px-4 text-sm font-semibold text-[#08192f] transition hover:bg-[#f4f9ff]";

function getFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TicketFilters {
  return {
    tenantId: typeof searchParams.tenantId === "string" ? searchParams.tenantId : undefined,
    status: typeof searchParams.status === "string" ? (searchParams.status as TicketFilters["status"]) : undefined,
    priority:
      typeof searchParams.priority === "string"
        ? (searchParams.priority as TicketFilters["priority"])
        : undefined,
    query: typeof searchParams.query === "string" ? searchParams.query : undefined,
    from: typeof searchParams.from === "string" ? searchParams.from : undefined,
    to: typeof searchParams.to === "string" ? searchParams.to : undefined,
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

export default async function AdminDashboard(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const filters = getFilters(searchParams);
  const [tenants, tickets] = await Promise.all([listTenants(), listTickets(filters)]);
  const metrics = calculateMetrics(tickets);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0d5f86]">
            Ticket yönetimi
          </p>
          <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight text-[#08192f]">
            Destek operasyonu
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5a6d85]">
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Toplam ticket" value={metrics.totalTickets} />
        <MetricTile label="Açık ticket" value={metrics.openTickets} />
        <MetricTile
          label="İlk yanıt ort."
          value={formatDurationMinutes(metrics.averageFirstResponseMinutes)}
        />
        <MetricTile
          label="Çözüm ort."
          value={formatDurationMinutes(metrics.averageResolutionMinutes)}
        />
      </section>

      <Surface className="bg-white">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-[#0d2342]" />
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#08192f]">
                Filtreler
              </h2>
              <p className="mt-1 text-sm text-[#5a6d85]">
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
              <option value="new">New</option>
              <option value="open">Open</option>
              <option value="waiting_customer">Waiting customer</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select name="priority" defaultValue={filters.priority ?? "all"}>
              <option value="all">Tüm öncelikler</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              <input name="from" type="date" defaultValue={filters.from ?? ""} />
              <input name="to" type="date" defaultValue={filters.to ?? ""} />
            </div>
            <button className={primaryButtonClass}>Uygula</button>
          </form>
        </div>
      </Surface>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.38fr)_minmax(320px,0.62fr)]">
        <Surface className="min-w-0 overflow-hidden bg-white p-0">
          <div className="flex flex-col gap-4 border-b border-[color:var(--line)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0d5f86]">
                Ticket listesi
              </p>
              <h2 className="font-heading mt-1 text-3xl font-semibold tracking-tight text-[#08192f]">
                Filtrelenmiş görünüm
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#eef5fb] px-3 py-2 text-sm font-semibold text-[#4f627a]">
              <MailOpen className="h-4 w-4 text-[#0d2342]" />
              {tickets.length} kayıt
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f7fbff] text-xs uppercase tracking-[0.18em] text-[#60748f]">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Müşteri</th>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Durum</th>
                  <th className="px-6 py-4">Öncelik</th>
                  <th className="px-6 py-4">İlk yanıt</th>
                  <th className="px-6 py-4">Geliş</th>
                  <th className="px-6 py-4 text-right">İşlem</th>
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
                    <tr key={ticket.id} className="border-t border-[color:var(--line)] transition hover:bg-[#f7fbff]">
                      <td className="px-6 py-5">
                        <Link href={`/ticket/admin/tickets/${ticket.id}`} className="group block">
                          <p className="font-semibold text-[#08192f] transition group-hover:text-[#0d5f86]">
                            {ticket.ticketCode}
                          </p>
                          <p className="mt-1 max-w-sm text-sm leading-7 text-[#4f627a]">
                            {ticket.subject}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#324a66]">
                        <p className="font-medium">{ticket.customerName ?? "İsimsiz kayıt"}</p>
                        <p className="mt-1 text-[#5a6d85]">{ticket.customerEmail}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#324a66]">{ticket.tenantName}</td>
                      <td className="px-6 py-5">
                        <StatusBadge value={ticket.status} />
                      </td>
                      <td className="px-6 py-5">
                        <PriorityBadge value={ticket.priority} />
                      </td>
                      <td className="px-6 py-5 text-sm text-[#324a66]">
                        {formatDurationMinutes(firstResponseMinutes)}
                      </td>
                      <td className="px-6 py-5 text-sm text-[#5a6d85]">
                        {formatDateTime(ticket.firstReceivedAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/ticket/admin/tickets/${ticket.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-[color:var(--line)] bg-white px-4 text-sm font-semibold text-[#08192f] transition hover:bg-[#eef5fb]"
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
              <div className="px-6 py-16 text-center text-[#5a6d85]">
                Seçili filtreler için ticket bulunamadı.
              </div>
            ) : null}
          </div>
        </Surface>

        <div className="min-w-0 space-y-6">
          <Surface className="overflow-hidden bg-white">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-[#0d2342]" />
              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-[#08192f]">
                  Yeni tenant
                </h2>
                <p className="mt-1 text-sm text-[#5a6d85]">
                  Yeni müşteri şirketi ve domain eşlemesi ekleyin.
                </p>
              </div>
            </div>

            <form action={createTenantAction} className="mt-6 grid gap-4">
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
              <button className={`w-full ${primaryButtonClass}`}>Tenant oluştur</button>
            </form>
          </Surface>

          <Surface className="overflow-hidden bg-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0d5f86]">
              Tenant listesi
            </p>
            <div className="mt-5 space-y-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="min-w-0 rounded-2xl border border-[color:var(--line)] bg-[#f7fbff] px-4 py-4"
                >
                  <p className="break-words font-semibold text-[#08192f]">{tenant.name}</p>
                  <p className="mt-1 break-all text-sm leading-7 text-[#5a6d85]">
                    {tenant.domains.join(", ") || "Henüz domain tanımlı değil"}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </section>
    </main>
  );
}
