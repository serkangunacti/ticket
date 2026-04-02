import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { requireMinimumRole } from "@/lib/auth";
import { getTenant } from "@/lib/data";
import { Surface } from "@/components/ticket-ui";

import { updateTenantAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function TenantDetailPage(props: {
  params: Promise<{ tenantId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireMinimumRole(["owner", "manager"]);
  const params = await props.params;
  const searchParams = (await props.searchParams) ?? {};
  const tenant = await getTenant(params.tenantId);
  const updated = searchParams.updated === "1";
  const hasError = searchParams.error === "tenant";

  if (!tenant) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-10">
        <Surface>
          <p className="text-lg font-semibold text-[#2a2e36]">Tenant bulunamadı.</p>
          <Link href="/ticket/admin" className="mt-4 inline-flex text-sm font-semibold text-[#7d6546]">
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
          href="/ticket/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7d6546]"
        >
          <ArrowLeft className="h-4 w-4" /> Panele dön
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#2a2e36]">
          Tenant düzenle
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6b655d]">
          Tenant bilgilerini, destek adresini ve bağlı domain listesini güncelleyin.
        </p>
      </div>

      <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
        {updated ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Tenant bilgileri kaydedildi.
          </div>
        ) : null}
        {hasError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            Tenant kaydedilemedi. Lütfen alanları kontrol edin.
          </div>
        ) : null}
        <form action={updateTenantAction} className="grid gap-5">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Tenant adı
            </label>
            <input name="name" defaultValue={tenant.name} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Destek e-posta adresi
            </label>
            <input
              name="supportAddress"
              type="email"
              defaultValue={tenant.supportAddress}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Domainler
            </label>
            <textarea
              name="domains"
              rows={5}
              className="resize-none"
              defaultValue={tenant.domains.join(", ")}
            />
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-4 py-3 text-sm text-[#3f4652]">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={tenant.isActive}
              className="h-4 w-4"
            />
            Tenant aktif kalsın
          </label>
          <SubmitButton
            pendingText="Kaydediliyor..."
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#2f3a49] px-5 text-sm font-semibold text-white hover:bg-[#24303e]"
          >
            Tenant bilgilerini kaydet
          </SubmitButton>
        </form>
      </Surface>
    </main>
  );
}
