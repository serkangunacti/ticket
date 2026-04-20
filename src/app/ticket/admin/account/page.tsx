import Link from "next/link";
import { Building2, KeyRound, Plus, Users } from "lucide-react";

import { SubmitButton } from "@/components/submit-button";
import { requireAdminSession } from "@/lib/auth";
import { getActiveLabel, getRoleLabel } from "@/lib/labels";
import { listSupportAgents, listTenants } from "@/lib/data";

import {
  changePasswordAction,
  createSupportAgentAction,
  createTenantAction,
  resetAgentPasswordAction,
  toggleSupportAgentStateAction,
  toggleTenantStateAction,
} from "../actions";

export const dynamic = "force-dynamic";

const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#102b4d_0%,#173d67_100%)] px-4 text-sm font-semibold text-white transition hover:shadow-[0_8px_20px_rgba(7,21,38,0.16)]";
const btnSecondary =
  "inline-flex h-9 items-center justify-center rounded-xl border border-[rgba(17,35,60,0.1)] bg-white/80 px-3 text-xs font-semibold text-[#102038] transition hover:bg-white hover:shadow-sm";
const cardClass =
  "rounded-2xl border border-[rgba(17,35,60,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(246,249,252,0.96)_100%)] p-5 shadow-[0_12px_28px_rgba(8,25,47,0.06)]";
const inputClass =
  "h-10 w-full rounded-xl border border-[rgba(17,35,60,0.12)] bg-white px-3 text-sm text-[#102038] outline-none transition focus:border-[#37c2e8]/40 focus:ring-1 focus:ring-[#37c2e8]/20";

export default async function AccountPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const searchParams = (await props.searchParams) ?? {};
  const updated = searchParams.updated === "1";
  const hasError = searchParams.error === "password";
  const resetError = searchParams.error === "reset";
  const resetDone = searchParams.reset === "1";
  const tenantCreated = searchParams.tenant === "created";
  const tenantUpdated = searchParams.tenant === "updated";
  const tenantError = searchParams.error === "tenant";
  const agentCreated = searchParams.agent === "created";
  const agentUpdated = searchParams.agent === "updated";
  const agentError = searchParams.error === "agent";

  const isOwner = session.role === "owner";
  const isManager = session.role === "manager";
  const canManageTeam = isOwner;
  const canManageTenants = isOwner || isManager;

  const [tenants, agents] = await Promise.all([
    canManageTenants ? listTenants() : Promise.resolve([]),
    canManageTeam ? listSupportAgents() : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d9f6ff_0%,#eef6fb_100%)] text-[#133961]">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#102038]">
            Şirketim
          </h1>
          <p className="mt-0.5 text-sm text-[#607287]">
            {session.email} · {getRoleLabel(session.role)}
          </p>
        </div>
      </div>

      {/* Success / error notifications */}
      {updated ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Şifreniz güncellendi. Lütfen tekrar giriş yapın.
        </div>
      ) : null}
      {resetDone ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Üye şifresi başarıyla sıfırlandı.
        </div>
      ) : null}
      {tenantCreated ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Tenant oluşturuldu.
        </div>
      ) : null}
      {agentCreated ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Ekip üyesi oluşturuldu ve davet akışı başlatıldı.
        </div>
      ) : null}
      {tenantUpdated || agentUpdated ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-900">
          Kayıt güncellendi.
        </div>
      ) : null}

      {/* ── Password change (everyone) ─────────────── */}
      <details className="group rounded-xl border border-[rgba(17,35,60,0.08)] bg-white/40">
        <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <KeyRound className="h-4 w-4 text-[#37c2e8]" />
          <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
            Şifremi değiştir
          </h2>
        </summary>
        <div className="border-t border-[rgba(17,35,60,0.08)] px-5 pb-5 pt-4">
          <p className="mb-4 text-xs leading-5 text-[#607287]">
            Şifre değiştirdikten sonra oturumunuz kapatılır ve giriş ekranına yönlendirilirsiniz.
          </p>
          {hasError ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900">
              Şifre değişikliği başarısız. Mevcut şifreyi kontrol edin.
            </div>
          ) : null}
          <form action={changePasswordAction} className="grid gap-3 max-w-lg">
            <input name="currentPassword" type="password" placeholder="Mevcut şifre" required className={inputClass} />
            <input name="nextPassword" type="password" placeholder="Yeni şifre" required className={inputClass} />
            <input name="confirmPassword" type="password" placeholder="Yeni şifre tekrar" required className={inputClass} />
            <SubmitButton pendingText="Güncelleniyor..." className={`w-full ${btnPrimary}`}>
              Şifreyi güncelle
            </SubmitButton>
          </form>
        </div>
      </details>

      {/* ── Team members (owner only) ─────────────── */}
      {canManageTeam ? (
        <section className={cardClass}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-[#37c2e8]" />
              <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
                Ekip üyeleri
              </h2>
            </div>
            <span className="rounded-full border border-[rgba(17,35,60,0.08)] bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold text-[#607287]">
              {agents.length} üye
            </span>
          </div>

          {agentError ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900">
              Ekip üyesi oluşturulamadı. Gerekli alanları kontrol edin.
            </div>
          ) : null}

          {/* Agent list */}
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id}>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(17,35,60,0.06)] bg-white/60 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#102038]">{agent.name}</p>
                    <p className="mt-0.5 text-xs text-[#607287]">
                      {agent.email} · {getRoleLabel(agent.role)} · {getActiveLabel(agent.isActive)}
                      {agent.invitePending ? " · Davet bekliyor" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/ticket/admin/team/${agent.id}`} className={btnSecondary}>
                      Düzenle
                    </Link>
                    {agent.id !== session.userId ? (
                      <details className="relative">
                        <summary className={`cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden ${btnSecondary}`}>
                          Şifre sıfırla
                        </summary>
                        <div className="absolute right-0 top-full z-10 mt-1.5 w-64 rounded-xl border border-[rgba(17,35,60,0.12)] bg-white p-3 shadow-lg">
                          {resetError ? (
                            <div className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-[0.65rem] font-medium text-rose-900">
                              Şifre sıfırlama başarısız.
                            </div>
                          ) : null}
                          <form action={resetAgentPasswordAction} className="grid gap-2">
                            <input type="hidden" name="agentId" value={agent.id} />
                            <input name="newPassword" type="password" placeholder="Yeni şifre" required className={`text-xs ${inputClass}`} />
                            <input name="confirmNewPassword" type="password" placeholder="Tekrar" required className={`text-xs ${inputClass}`} />
                            <SubmitButton pendingText="..." className={`w-full text-xs ${btnPrimary}`}>
                              Sıfırla
                            </SubmitButton>
                          </form>
                        </div>
                      </details>
                    ) : null}
                    <form action={toggleSupportAgentStateAction}>
                      <input type="hidden" name="agentId" value={agent.id} />
                      <input type="hidden" name="isActive" value={agent.isActive ? "false" : "true"} />
                      <button className={btnSecondary}>
                        {agent.isActive ? "Pasif" : "Aktif"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add agent form */}
          <details className="group/add mt-4 rounded-xl border border-[rgba(17,35,60,0.08)] bg-white/40">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-[#102038] [&::-webkit-details-marker]:hidden">
              <Plus className="h-3.5 w-3.5 transition-transform group-open/add:rotate-45" /> Yeni ekip üyesi ekle
            </summary>
            <div className="border-t border-[rgba(17,35,60,0.08)] px-4 pb-4 pt-3">
              <form action={createSupportAgentAction} className="grid gap-3 sm:grid-cols-2">
                <input name="name" placeholder="Ad soyad" required className={inputClass} />
                <input name="email" type="email" placeholder="ekip@uptexx.com" required className={inputClass} />
                <select name="role" defaultValue="agent" className={`sm:col-span-2 ${inputClass}`}>
                  <option value="agent">Destek Uzmanı</option>
                  <option value="manager">Yönetici</option>
                  <option value="owner">Sahip</option>
                </select>
                <SubmitButton pendingText="Oluşturuluyor..." className={`w-full sm:col-span-2 ${btnPrimary}`}>
                  Ekip üyesi ekle
                </SubmitButton>
              </form>
            </div>
          </details>
        </section>
      ) : null}

      {/* ── Tenant management (owner/manager) ─────── */}
      {canManageTenants ? (
        <section className={cardClass}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-[#37c2e8]" />
              <h2 className="text-lg font-semibold tracking-tight text-[#102038]">
                Tenantlar
              </h2>
            </div>
            <span className="rounded-full border border-[rgba(17,35,60,0.08)] bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold text-[#607287]">
              {tenants.length} tenant
            </span>
          </div>

          {tenantError ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900">
              Tenant oluşturulamadı. Gerekli alanları kontrol edin.
            </div>
          ) : null}

          {/* Tenant list */}
          <div className="space-y-2">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(17,35,60,0.06)] bg-white/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#102038]">{tenant.name}</p>
                  <p className="mt-0.5 text-xs text-[#607287]">
                    {tenant.domains.join(", ") || "Henüz domain yok"} · {getActiveLabel(tenant.isActive)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href={`/ticket/admin/tenants/${tenant.id}`} className={btnSecondary}>
                    Düzenle
                  </Link>
                  <form action={toggleTenantStateAction}>
                    <input type="hidden" name="tenantId" value={tenant.id} />
                    <input type="hidden" name="isActive" value={tenant.isActive ? "false" : "true"} />
                    <button className={btnSecondary}>
                      {tenant.isActive ? "Pasif" : "Aktif"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Add tenant form */}
          <details className="group/add mt-4 rounded-xl border border-[rgba(17,35,60,0.08)] bg-white/40">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-[#102038] [&::-webkit-details-marker]:hidden">
              <Plus className="h-3.5 w-3.5 transition-transform group-open/add:rotate-45" /> Yeni tenant ekle
            </summary>
            <div className="border-t border-[rgba(17,35,60,0.08)] px-4 pb-4 pt-3">
              <form action={createTenantAction} className="grid gap-3 sm:grid-cols-2">
                <input name="name" placeholder="Müşteri şirket adı" required className={inputClass} />
                <input
                  name="supportAddress"
                  placeholder="destek@uptexx.com"
                  defaultValue="destek@uptexx.com"
                  required
                  className={inputClass}
                />
                <textarea
                  name="domains"
                  rows={2}
                  placeholder="acme.com.tr, acmelojistik.com"
                  className={`resize-none sm:col-span-2 ${inputClass} h-auto py-2`}
                />
                <SubmitButton pendingText="Oluşturuluyor..." className={`w-full sm:col-span-2 ${btnPrimary}`}>
                  Tenant oluştur
                </SubmitButton>
              </form>
            </div>
          </details>
        </section>
      ) : null}
    </main>
  );
}
