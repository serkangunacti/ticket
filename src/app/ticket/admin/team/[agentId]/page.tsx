import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { Surface } from "@/components/ticket-ui";
import { requireMinimumRole } from "@/lib/auth";
import { getRoleLabel } from "@/lib/labels";
import { getSupportAgent } from "@/lib/data";
import { getSiteSettings, slugify } from "@/lib/site-settings";

import { updateSupportAgentAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function TeamMemberDetailPage(props: {
  params: Promise<{ agentId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMinimumRole(["owner"]);
  const params = await props.params;
  const searchParams = (await props.searchParams) ?? {};
  const agent = await getSupportAgent(params.agentId);
  const updated = searchParams.updated === "1";
  const hasError = searchParams.error === "agent";

  const settings = await getSiteSettings();
  const basePath = `/ticket/${slugify(settings.companyName)}`;

  if (!agent) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10">
        <Surface>
          <p className="text-lg font-semibold text-[#2a2e36]">Ekip üyesi bulunamadı.</p>
          <Link href={basePath} className="mt-4 inline-flex text-sm font-semibold text-[#7d6546]">
            Panele dön
          </Link>
        </Surface>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10">
      <div>
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d6546]"
        >
          <ArrowLeft className="h-4 w-4" /> Panele dön
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#2a2e36]">
          Ekip üyesi düzenle
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6b655d]">
          Yetki seviyesini ve panel erişimini buradan yönetin.
        </p>
      </div>

      <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
        {updated ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Ekip üyesi bilgileri kaydedildi.
          </div>
        ) : null}
        {hasError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            Ekip üyesi kaydedilemedi. Lütfen bilgileri kontrol edin.
          </div>
        ) : null}
        <form action={updateSupportAgentAction} className="grid gap-5">
          <input type="hidden" name="agentId" value={agent.id} />
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Ad soyad
            </label>
            <input name="name" defaultValue={agent.name} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              E-posta
            </label>
            <input value={agent.email} disabled />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Rol
            </label>
            <select name="role" defaultValue={agent.role}>
              <option value="agent">Destek Uzmanı</option>
              <option value="manager">Yönetici</option>
              <option value="owner">Sahip</option>
            </select>
            <p className="mt-2 text-xs leading-6 text-[#6b655d]">
              Mevcut rol: {getRoleLabel(agent.role)}
            </p>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-4 py-3 text-sm text-[#3f4652]">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={agent.isActive}
              className="h-4 w-4"
            />
            Hesap aktif kalsın
          </label>
          <div className="rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-4 py-4 text-sm text-[#6b655d]">
            {agent.invitePending
              ? "Bu kullanıcı henüz daveti tamamlamadı ve ilk şifresini belirlemedi."
              : "Bu kullanıcı panel erişimini tamamladı ve giriş yapabiliyor."}
          </div>
          <SubmitButton
            pendingText="Kaydediliyor..."
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#2f3a49] px-5 text-sm font-semibold text-white hover:bg-[#24303e]"
          >
            Ekip üyesini kaydet
          </SubmitButton>
        </form>
      </Surface>
    </main>
  );
}
