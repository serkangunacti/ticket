import Link from "next/link";
import { ArrowLeft, MessageSquareQuote, SendHorizonal } from "lucide-react";

import { PriorityBadge, SectionLabel, StatusBadge, Surface } from "@/components/ticket-ui";
import { getTicketDetail } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

import { addTicketMessageAction, updateTicketAction } from "../../actions";

export default async function TicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.params;
  const ticket = await getTicketDetail(params.ticketId);

  if (!ticket) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-10">
        <Surface>
          <p className="text-lg font-semibold text-[#08192f]">Ticket bulunamadı.</p>
          <Link href="/ticket/admin" className="mt-4 inline-flex text-sm font-semibold text-[#0d5f86]">
            Listeye dön
          </Link>
        </Surface>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/ticket/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d5f86]"
          >
            <ArrowLeft className="h-4 w-4" /> Ticket listesine dön
          </Link>
          <h1 className="font-heading mt-4 text-5xl font-semibold tracking-tight text-[#08192f]">
            {ticket.ticketCode}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[#5a6d85]">
            {ticket.subject}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Surface className="space-y-6 bg-white">
          <div>
            <SectionLabel>Ticket özeti</SectionLabel>
            <div className="mt-6 space-y-3 text-sm leading-7 text-[#324a66]">
              <p>
                <span className="font-semibold text-[#08192f]">Tenant:</span>{" "}
                {ticket.tenantName}
              </p>
              <p>
                <span className="font-semibold text-[#08192f]">Domainler:</span>{" "}
                {ticket.tenantDomains.join(", ") || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#08192f]">Müşteri:</span>{" "}
                {ticket.customerName ?? "İsimsiz kayıt"} ({ticket.customerEmail})
              </p>
              <p>
                <span className="font-semibold text-[#08192f]">Geliş zamanı:</span>{" "}
                {formatDateTime(ticket.firstReceivedAt)}
              </p>
              <p>
                <span className="font-semibold text-[#08192f]">İlk müdahale:</span>{" "}
                {formatDateTime(ticket.firstResponseAt)}
              </p>
              <p>
                <span className="font-semibold text-[#08192f]">Çözüm zamanı:</span>{" "}
                {formatDateTime(ticket.resolvedAt)}
              </p>
            </div>
          </div>

          <form action={updateTicketAction} className="space-y-4 border-t border-[color:var(--line)] pt-6">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#324a66]">
                  Durum
                </label>
                <select name="status" defaultValue={ticket.status}>
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="waiting_customer">Waiting customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#324a66]">
                  Öncelik
                </label>
                <select name="priority" defaultValue={ticket.priority}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#324a66]">
                Çözüm notu
              </label>
              <textarea
                name="resolutionNote"
                rows={4}
                defaultValue={ticket.resolutionNote ?? ""}
                placeholder="Yapılan işlem, kök neden, kalıcı çözüm"
              />
            </div>
            <button className="w-full rounded-full bg-[#08192f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2342]">
              Ticket güncelle
            </button>
          </form>

          <form action={addTicketMessageAction} className="space-y-4 border-t border-[color:var(--line)] pt-6">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#324a66]">
                Ticket mesajı
              </label>
              <textarea
                name="bodyText"
                rows={6}
                placeholder="Müşteriye gönderilecek yanıt veya iç notunuzu yazın"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                name="direction"
                value="outbound"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#05c7f2] px-5 py-3 text-sm font-semibold text-[#061426] transition hover:bg-[#7ee9ff]"
              >
                <SendHorizonal className="h-4 w-4" /> Müşteriye mail gönder
              </button>
              <button
                name="direction"
                value="internal"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--line)] px-5 py-3 text-sm font-semibold text-[#08192f] transition hover:bg-[#eef5fb]"
              >
                <MessageSquareQuote className="h-4 w-4" /> İç not ekle
              </button>
            </div>
          </form>
        </Surface>

        <Surface className="bg-white p-0">
          <div className="border-b border-[color:var(--line)] px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0d5f86]">
              Ticket geçmişi
            </p>
            <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
              Yazışma akışı
            </h2>
          </div>

          <div className="space-y-5 p-6">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-[24px] border p-5 ${
                  message.direction === "internal"
                    ? "border-cyan-200 bg-cyan-50"
                    : message.authorType === "admin"
                      ? "border-blue-100 bg-[#f4f9ff]"
                      : "border-[color:var(--line)] bg-[#f7fbff]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0d5f86]">
                      {message.direction === "internal"
                        ? "İç not"
                        : message.authorType === "admin"
                          ? "Admin yanıtı"
                          : "Müşteri maili"}
                    </p>
                    <p className="mt-2 text-xs text-[#5a6d85]">
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                  {message.subject ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#5a6d85]">
                      {message.subject}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[#1f2f45]">
                  {message.bodyText}
                </p>

                {message.attachments.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <span
                        key={attachment.id}
                        className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1 text-xs font-medium text-[#5a6d85]"
                      >
                        {attachment.fileName}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Surface>
      </section>
    </main>
  );
}
