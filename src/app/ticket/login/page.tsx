import Link from "next/link";
import { AlertCircle, LockKeyhole, Mail } from "lucide-react";

import { SectionLabel, Surface } from "@/components/ticket-ui";
import { hasAdminCredentials } from "@/lib/env";

import { loginAction } from "./actions";

export default async function LoginPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const error = searchParams.error;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#061426_0%,#0d2342_44%,#f8fbff_44%,#f8fbff_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between rounded-[36px] border border-white/10 bg-white/6 p-8 text-white backdrop-blur-sm">
          <div>
            <SectionLabel>Yönetim Girişi</SectionLabel>
            <h1 className="font-heading mt-6 text-5xl font-semibold tracking-tight">
              Uptexx destek operasyonuna giriş yapın.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#d7e9fb]">
              Bu ekran yalnızca iç kullanım içindir. Mail sync, tenant filtreleme,
              export ve ticket yazışmaları bu panelden yönetilir.
            </p>
          </div>

          <div className="space-y-4 text-sm text-[#d4e6fa]">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-[#8fe9ff]" />
              <p>Mail thread takibiyle aynı ticket üzerinden ilerleyen süreç</p>
            </div>
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-1 h-5 w-5 text-[#8fe9ff]" />
              <p>Yalnızca tanımlı admin hesabına açık giriş yapısı</p>
            </div>
          </div>
        </div>

        <Surface className="self-center p-8 lg:p-12">
          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0d5f86]">
              Admin Access
            </p>
            <h2 className="font-heading mt-4 text-4xl font-semibold tracking-tight text-[#08192f]">
              E-posta ve şifre ile oturum açın
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5a6d85]">
              Local kurulumda `.env.local` içine `ADMIN_EMAIL` ve
              `ADMIN_PASSWORD` değerlerini tanımladıktan sonra giriş yapabilirsiniz.
            </p>
          </div>

          {!hasAdminCredentials ? (
            <div className="mt-8 rounded-[24px] border border-cyan-200 bg-cyan-50 p-5 text-cyan-950">
              <p className="font-semibold">Admin hesabı henüz tanımlı değil.</p>
              <p className="mt-2 text-sm leading-7">
                Başlamak için `.env.local` içinde `ADMIN_EMAIL` ve `ADMIN_PASSWORD`
                değerlerini ekleyin. Örnek yapı için `.env.example` dosyasını
                kullanabilirsiniz.
              </p>
            </div>
          ) : null}

          {error === "invalid" ? (
            <div className="mt-8 flex items-start gap-3 rounded-[22px] border border-rose-200 bg-rose-50 p-5 text-rose-900">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Giriş bilgileri doğrulanamadı.</p>
                <p className="mt-1 text-sm">E-posta veya şifreyi tekrar kontrol edin.</p>
              </div>
            </div>
          ) : null}

          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#324a66]">
                E-posta adresi
              </label>
              <input name="email" type="email" placeholder="you@uptexx.com" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#324a66]">
                Şifre
              </label>
              <input
                name="password"
                type="password"
                placeholder="Güçlü admin şifresi"
                required
              />
            </div>
            <button className="w-full rounded-full bg-[#08192f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2342]">
              Giriş yap
            </button>
          </form>

          <Link
            href="/ticket"
            className="mt-6 inline-flex text-sm font-semibold text-[#0d5f86] transition hover:text-[#08192f]"
          >
            Geri dön
          </Link>
        </Surface>
      </div>
    </main>
  );
}
