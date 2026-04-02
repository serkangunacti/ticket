import { Surface } from "@/components/ticket-ui";
import { requireAdminSession } from "@/lib/auth";
import { getRoleLabel } from "@/lib/labels";

import { changePasswordAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AccountPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const searchParams = (await props.searchParams) ?? {};
  const updated = searchParams.updated === "1";
  const hasError = searchParams.error === "password";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 lg:px-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a6d4b]">
          Hesabım
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#2a2e36]">
          Şifre ve hesap bilgileri
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6b655d]">
          {session.email} hesabı ile giriş yaptınız. Rolünüz: {getRoleLabel(session.role)}.
        </p>
      </div>

      <Surface className="border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] shadow-[0_18px_60px_rgba(69,53,32,0.06)]">
        {updated ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Şifreniz güncellendi.
          </div>
        ) : null}
        {hasError ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
            Şifre değişikliği başarısız oldu. Mevcut şifreyi kontrol edin.
          </div>
        ) : null}

        <form action={changePasswordAction} className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Mevcut şifre
            </label>
            <input name="currentPassword" type="password" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Yeni şifre
            </label>
            <input name="nextPassword" type="password" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
              Yeni şifre tekrar
            </label>
            <input name="confirmPassword" type="password" required />
          </div>
          <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#2f3a49] px-5 text-sm font-semibold text-white transition hover:bg-[#24303e]">
            Şifreyi güncelle
          </button>
        </form>
      </Surface>
    </main>
  );
}
