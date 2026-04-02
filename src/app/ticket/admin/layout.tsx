import Link from "next/link";

import { requireAdminSession } from "@/lib/auth";
import { getRoleLabel } from "@/lib/labels";
import { env, hasDatabase, hasMicrosoftMail } from "@/lib/env";

import { logoutAction, syncMailboxAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-[#f4eee5] text-[#2a2e36]">
      <header className="border-b border-[rgba(42,46,54,0.08)] bg-[#f8f2e9]/92 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div>
            <Link href="/ticket/admin" className="text-2xl font-semibold tracking-tight text-[#2a2e36]">
              Uptexx Ticket
            </Link>
            <p className="mt-1 text-sm text-[#6b655d]">
              {session.email} ile giriş yapıldı • {getRoleLabel(session.role)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#efe5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b655d]">
              DB {hasDatabase ? "TiDB ready" : "mock mode"}
            </span>
            <span className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#efe5d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b655d]">
              Mail {hasMicrosoftMail ? "Microsoft" : env.MAIL_SYNC_MODE}
            </span>
            <form action={syncMailboxAction}>
              <button className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] px-4 py-2 text-sm font-semibold text-[#2a2e36] transition hover:bg-[#efe5d7]">
                Mail senkronize et
              </button>
            </form>
            <Link
              href="/ticket/admin/account"
              className="rounded-full border border-[rgba(42,46,54,0.08)] bg-[#fbf7f1] px-4 py-2 text-sm font-semibold text-[#2a2e36] transition hover:bg-[#efe5d7]"
            >
              Hesabım
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full bg-[#2f3a49] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24303e]">
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
