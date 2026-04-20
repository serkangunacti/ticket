import Link from "next/link";

import { HeaderBrand } from "@/components/header-brand";
import { requireAdminSession } from "@/lib/auth";
import { getRoleLabel } from "@/lib/labels";
import { getSiteSettings, slugify } from "@/lib/site-settings";

import { logoutAction, updateSiteSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();
  const settings = await getSiteSettings();
  const slug = slugify(settings.companyName);
  const basePath = `/ticket/${slug}`;

  return (
    <div className="min-h-screen text-[#102038]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(135deg,#071526_0%,#0f2745_58%,#163b66_100%)] text-white shadow-[0_18px_40px_rgba(7,21,38,0.2)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <HeaderBrand
              companyName={settings.companyName}
              logoDataUrl={settings.logoDataUrl}
              canEdit={session.role === "owner"}
              updateAction={updateSiteSettingsAction}
            />
            <div>
              <p className="mt-1 text-sm text-[#c1d5eb]">
                {session.email} · {getRoleLabel(session.role)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`${basePath}/account`}
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
