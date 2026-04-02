import Link from "next/link";

import { Surface } from "@/components/ticket-ui";
import { getSupportAgentByInviteToken } from "@/lib/data";

import { completeInviteAction } from "../admin/actions";

export const dynamic = "force-dynamic";

export default async function ActivatePage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  const error = typeof searchParams.error === "string" ? searchParams.error : "";
  const agent = token ? await getSupportAgentByInviteToken(token) : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#061426_0%,#0d2342_100%)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center py-10">
        <Surface className="w-full max-w-2xl p-8 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0d5f86]">
            İlk giriş
          </p>
          <h1 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-[#08192f]">
            Panel hesabınızı etkinleştirin
          </h1>
          <p className="mt-4 text-base leading-8 text-[#5a6d85]">
            Davet e-postasındaki bağlantıyı kullanarak kendi şifrenizi belirleyin.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
              Davet bağlantısı geçersiz veya süresi dolmuş görünüyor.
            </div>
          ) : null}

          {!agent ? (
            <div className="mt-8 rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-4 py-4 text-sm text-[#6b655d]">
              Geçerli bir davet bulunamadı. Gerekirse panel yöneticinizden yeni davet
              göndermesini isteyin.
            </div>
          ) : (
            <form action={completeInviteAction} className="mt-8 grid gap-5">
              <input type="hidden" name="token" value={token} />
              <div className="rounded-2xl border border-[rgba(42,46,54,0.08)] bg-[#fffaf2] px-4 py-4 text-sm text-[#3f4652]">
                <p className="font-semibold text-[#2a2e36]">{agent.name}</p>
                <p className="mt-1">{agent.email}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                  Yeni şifre
                </label>
                <input name="password" type="password" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#4e5562]">
                  Yeni şifre tekrar
                </label>
                <input name="confirmPassword" type="password" required />
              </div>
              <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#2f3a49] px-5 text-sm font-semibold text-white transition hover:bg-[#24303e]">
                Hesabı etkinleştir
              </button>
            </form>
          )}

          <Link
            href="/ticket/login"
            className="mt-6 inline-flex text-sm font-semibold text-[#0d5f86] transition hover:text-[#08192f]"
          >
            Giriş ekranına dön
          </Link>
        </Surface>
      </div>
    </main>
  );
}
