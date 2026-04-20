import Link from "next/link";
import { Building2 } from "lucide-react";

import { requireAdminSession } from "@/lib/auth";
import { getRoleLabel } from "@/lib/labels";

import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen text-[#102038]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(135deg,#071526_0%,#0f2745_58%,#163b66_100%)] text-white shadow-[0_18px_40px_rgba(7,21,38,0.2)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-[#8de7ff]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <Link href="/ticket/admin" className="text-2xl font-semibold tracking-tight text-white">
                Uptexx Ticket
              </Link>
              <p className="mt-1 text-sm text-[#c1d5eb]">
                {session.email} · {getRoleLabel(session.role)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/ticket/admin/account"
              className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
            >
              Şirketim
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full bg-[#37c2e8] px-4 py-2 text-sm font-semibold text-[#071526] transition hover:bg-[#5fd3f0]">
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
