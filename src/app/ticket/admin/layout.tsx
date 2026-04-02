import Link from "next/link";

import { requireAdminSession } from "@/lib/auth";
import { env, hasDatabase, hasMicrosoftMail } from "@/lib/env";

import { logoutAction, syncMailboxAction } from "./actions";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <header className="border-b border-[color:var(--line)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div>
            <Link href="/ticket/admin" className="font-heading text-2xl font-semibold">
              Uptexx Ticket
            </Link>
            <p className="mt-1 text-sm text-[#5a6d85]">
              {session.email} ile giriş yapıldı
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[color:var(--line)] bg-[#eef5fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f627a]">
              DB {hasDatabase ? "TiDB ready" : "mock mode"}
            </span>
            <span className="rounded-full border border-[color:var(--line)] bg-[#eef5fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f627a]">
              Mail {hasMicrosoftMail ? "Microsoft" : env.MAIL_SYNC_MODE}
            </span>
            <form action={syncMailboxAction}>
              <button className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm font-semibold text-[#08192f] transition hover:bg-[#eef5fb]">
                Mail senkronize et
              </button>
            </form>
            <form action={logoutAction}>
              <button className="rounded-full bg-[#08192f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2342]">
                Çıkış yap
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
