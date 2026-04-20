import Link from "next/link";
import { ArrowLeft, MessageSquareQuote, SendHorizonal } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { PriorityBadge, SectionLabel, StatusBadge, Surface } from "@/components/ticket-ui";
import { listSupportAgents, getTicketDetail } from "@/lib/data";
import { getActiveLabel } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import { getSiteSettings, slugify } from "@/lib/site-settings";

import { addTicketMessageAction, updateTicketAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.params;
  const searchParams = (await props.searchParams) ?? {};
  const [ticket, agents] = await Promise.all([
    getTicketDetail(params.ticketId),
    listSupportAgents(),
  ]);
  const updated = searchParams.updated === "1";
  const messageSent = searchParams.message === "sent";
  const messageError = searchParams.error === "message";

  const settings = await getSiteSettings();
  const basePath = `/ticket/${slugify(settings.companyName)}`;

  if (!ticket) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-10">
        <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
          <p className="text-lg font-semibold text-[#2a2e36]">Ticket bulunamadı.</p>
          <Link href={basePath} className="mt-4 inline-flex text-sm font-semibold text-[#7d6546]">
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
            href={basePath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d6546]"
          >
            <ArrowLeft className="h-4 w-4" /> Ticket listesine dön
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#2a2e36]">
            {ticket.ticketCode}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-8 text-[#6b655d]">
            {ticket.subject}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatusBadge value={ticket.status} />
          <PriorityBadge value={ticket.priority} />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Surface className="space-y-6 border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
          {updated ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              Ticket bilgileri güncellendi.
            </div>
          ) : null}
          {messageSent ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              Ticket mesajı kaydedildi.
            </div>
          ) : null}
          {messageError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
              Mesaj alanı boş bırakılamaz.
            </div>
          ) : null}
          <div>
            <SectionLabel className="border-[#d7cdbd] bg-[#efe5d7] text-[#7d6546]">
              Ticket özeti
            </SectionLabel>
            <div className="mt-6 space-y-3 text-sm leading-7 text-[#4e5562]">
              <p>
                <span className="font-semibold text-[#2a2e36]">Tenant:</span>{" "}
                {ticket.tenantName}
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">Tenant durumu:</span>{" "}
                {getActiveLabel(ticket.tenantIsActive)}
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">Domainler:</span>{" "}
                {ticket.tenantDomains.join(", ") || "-"}
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">Atanan kişi:</span>{" "}
                {ticket.assigneeName ?? "Henüz atama yapılmadı"}
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">Müşteri:</span>{" "}
                {ticket.customerName ?? "İsimsiz kayıt"} ({ticket.customerEmail})
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">Geliş zamanı:</span>{" "}
                {formatDateTime(ticket.firstReceivedAt)}
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">İlk müdahale:</span>{" "}
                {formatDateTime(ticket.firstResponseAt)}
              </p>
              <p>
                <span className="font-semibold text-[#2a2e36]">Çözüm zamanı:</span>{" "}
                {formatDateTime(ticket.resolvedAt)}
              </p>
            </div>
          </div>

          <form
            action={updateTicketAction}
            className="space-y-4 border-t border-[rgba(42,46,54,0.08)] pt-6"
          >
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                  Durum
                </label>
                <select name="status" defaultValue={ticket.status}>
                  <option value="new">Yeni</option>
                  <option value="open">Açık</option>
                  <option value="waiting_customer">Müşteri yanıtı bekleniyor</option>
                  <option value="resolved">Çözüldü</option>
                  <option value="closed">Kapatıldı</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                  Öncelik
                </label>
                <select name="priority" defaultValue={ticket.priority}>
                  <option value="low">Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                Atanan kişi
              </label>
              <select name="assigneeId" defaultValue={ticket.assigneeId ?? "unassigned"}>
                <option value="unassigned">Atama yok</option>
                {agents
                  .filter((agent) => agent.isActive || agent.id === ticket.assigneeId)
                  .map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                Çözüm notu
              </label>
              <textarea
                name="resolutionNote"
                rows={4}
                defaultValue={ticket.resolutionNote ?? ""}
                placeholder="Yapılan işlem, kök neden, kalıcı çözüm"
              />
            </div>
            <SubmitButton
              pendingText="Güncelleniyor..."
              className="w-full rounded-full bg-[#2f3a49] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24303e]"
            >
              Ticket güncelle
            </SubmitButton>
          </form>

          <form
            action={addTicketMessageAction}
            className="space-y-4 border-t border-[rgba(42,46,54,0.08)] pt-6"
          >
            <input type="hidden" name="ticketId" value={ticket.id} />
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                Ticket mesajı
              </label>
              <textarea
                name="bodyText"
                rows={6}
                placeholder="Müşteriye gönderilecek yanıt veya iç notunuzu yazın"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SubmitButton
                name="direction"
                value="outbound"
                pendingText="Gönderiliyor..."
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8dc7d6] px-5 py-3 text-sm font-semibold text-[#102235] hover:bg-[#a7d7e3]"
              >
                <SendHorizonal className="h-4 w-4" /> Müşteriye mail gönder
              </SubmitButton>
              <SubmitButton
                name="direction"
                value="internal"
                pendingText="Kaydediliyor..."
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(42,46,54,0.08)] bg-[#f6efe6] px-5 py-3 text-sm font-semibold text-[#2a2e36] hover:bg-[#eadfce]"
              >
                <MessageSquareQuote className="h-4 w-4" /> İç not ekle
              </SubmitButton>
            </div>
          </form>
        </Surface>

        <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] p-0 shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
          <div className="border-b border-[rgba(42,46,54,0.08)] px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a6d4b]">
              Ticket geçmişi
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#2a2e36]">
              Yazışma akışı
            </h2>
          </div>

          <div className="space-y-5 p-6">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-[24px] border p-5 ${
                  message.direction === "internal"
                    ? "border-[#d9cfbf] bg-[#f1e7da]"
                    : message.authorType === "admin"
                      ? "border-[#d8e2e8] bg-[#f4f1eb]"
                      : "border-[rgba(42,46,54,0.08)] bg-[#f8f4ee]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
                      {message.direction === "internal"
                        ? "İç not"
                        : message.authorType === "admin"
                          ? "Admin yanıtı"
                          : "Müşteri maili"}
                    </p>
                    <p className="mt-2 text-xs text-[#6b655d]">
                      {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                  {message.subject ? (
                    <span className="rounded-full bg-[#fffaf2] px-3 py-1 text-xs font-medium text-[#6b655d]">
                      {message.subject}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[#37404e]">
                  {message.bodyText}
                </p>

                {message.attachments.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <span
                        key={attachment.id}
                        className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-3 py-1 text-xs font-medium text-[#6b655d]"
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
