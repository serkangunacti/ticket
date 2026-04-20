import Link from "next/link";
import { AlertCircle, Shield, ArrowRight } from "lucide-react";

import { hasAdminCredentials } from "@/lib/env";

import { loginAction } from "./actions";

export default async function LoginPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const error = searchParams.error;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060e1a]">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(55,194,232,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(20,59,103,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-[26rem] px-5 py-10">
        {/* Logo / brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(55,194,232,0.1)]">
            <Shield className="h-7 w-7 text-[#37c2e8]" />
          </div>
          <h1 className="font-heading mt-5 text-2xl font-semibold tracking-tight text-white">
            Uptexx Ticket
          </h1>
          <p className="mt-2 text-sm text-[#7a93b0]">
            Yönetim paneline giriş yapın
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
          {!hasAdminCredentials ? (
            <div className="mb-5 rounded-xl border border-[#37c2e8]/20 bg-[#37c2e8]/5 px-4 py-3 text-sm text-[#8de7ff]">
              <p className="font-medium">Admin hesabı henüz tanımlı değil.</p>
              <p className="mt-1 text-xs leading-5 text-[#7a93b0]">
                ADMIN_EMAIL ve ADMIN_PASSWORD ortam değişkenlerini tanımlayın.
              </p>
            </div>
          ) : null}

          {error === "invalid" ? (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-sm text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Giriş bilgileri doğrulanamadı.</p>
                <p className="mt-0.5 text-xs text-rose-400/70">E-posta veya şifreyi kontrol edin.</p>
              </div>
            </div>
          ) : null}

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wide text-[#7a93b0]">
                E-posta
              </label>
              <input
                name="email"
                type="email"
                placeholder="admin@uptexx.com"
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-[#4a6180] outline-none transition focus:border-[#37c2e8]/40 focus:ring-1 focus:ring-[#37c2e8]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wide text-[#7a93b0]">
                Şifre
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-[#4a6180] outline-none transition focus:border-[#37c2e8]/40 focus:ring-1 focus:ring-[#37c2e8]/20"
              />
            </div>
            <button className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#143b67_0%,#1a4f8a_100%)] text-sm font-semibold text-white transition hover:shadow-[0_8px_24px_rgba(20,59,103,0.4)]">
              Giriş yap
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/ticket"
            className="text-xs font-medium text-[#5a7a9b] transition hover:text-[#37c2e8]"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
