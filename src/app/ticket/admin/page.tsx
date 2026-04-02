import Link from "next/link";
import { Download, Filter, MailOpen, Plus } from "lucide-react";

import { MetricTile, PriorityBadge, StatusBadge, Surface } from "@/components/ticket-ui";
import { calculateMetrics } from "@/lib/reports";
import { listTenants, listTickets } from "@/lib/data";
import type { TicketFilters } from "@/lib/types";
import { formatDateTime, formatDurationMinutes } from "@/lib/utils";

import { createTenantAction } from "./actions";

const primaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#2f3a49] px-4 text-sm font-semibold text-white transition hover:bg-[#24303e]";
const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] px-4 text-sm font-semibold text-[#2a2e36] transition hover:bg-[#efe5d7]";

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

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f2eadf] text-xs uppercase tracking-[0.18em] text-[#7a746c]">
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
                    <tr
                      key={ticket.id}
                      className="border-t border-[rgba(42,46,54,0.08)] transition hover:bg-[#f6efe6]"
                    >
                      <td className="px-6 py-5">
                        <Link href={`/ticket/admin/tickets/${ticket.id}`} className="group block">
                          <p className="font-semibold text-[#2a2e36] transition group-hover:text-[#7d6546]">
                            {ticket.ticketCode}
                          </p>
                          <p className="mt-1 max-w-sm text-sm leading-7 text-[#5f6774]">
                            {ticket.subject}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#3f4652]">
                        <p className="font-medium">{ticket.customerName ?? "İsimsiz kayıt"}</p>
                        <p className="mt-1 text-[#6b655d]">{ticket.customerEmail}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#3f4652]">{ticket.tenantName}</td>
                      <td className="px-6 py-5">
                        <StatusBadge value={ticket.status} />
                      </td>
                      <td className="px-6 py-5">
                        <PriorityBadge value={ticket.priority} />
                      </td>
                      <td className="px-6 py-5 text-sm text-[#3f4652]">
                        {formatDurationMinutes(firstResponseMinutes)}
                      </td>
                      <td className="px-6 py-5 text-sm text-[#6b655d]">
                        {formatDateTime(ticket.firstReceivedAt)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/ticket/admin/tickets/${ticket.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-4 text-sm font-semibold text-[#2a2e36] transition hover:bg-[#eadfce]"
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

        <div className="min-w-0 space-y-6">
          <Surface className="overflow-hidden border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-[#7d6546]" />
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[#2a2e36]">
                  Yeni tenant
                </h2>
                <p className="mt-1 text-sm text-[#6b655d]">
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
                  <p className="break-words font-semibold text-[#2a2e36]">{tenant.name}</p>
                  <p className="mt-1 break-all text-sm leading-7 text-[#6b655d]">
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
