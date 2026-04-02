"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  requireAdminSession,
  requireMinimumRole,
} from "@/lib/auth";
import {
  activateSupportAgent,
  addTicketMessage,
  changeSupportAgentPassword,
  createSupportAgent,
  createTenant,
  setSupportAgentActiveState,
  setTenantActiveState,
  syncInbox,
  updateSupportAgent,
  updateTenant,
  updateTicket,
} from "@/lib/data";

function getAppBaseUrl(headerMap: Headers) {
  const origin = headerMap.get("origin");
  if (origin) return origin;
  const proto = headerMap.get("x-forwarded-proto") ?? "https";
  const host = headerMap.get("x-forwarded-host") ?? headerMap.get("host");
  if (host) return `${proto}://${host}`;
  return "https://ticket-93qc.vercel.app";
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/ticket/login");
}

export async function createTenantAction(formData: FormData) {
  const session = await requireMinimumRole(["owner", "manager"]);
  const name = String(formData.get("name") ?? "").trim();
  const supportAddress = String(formData.get("supportAddress") ?? "").trim();
  const domains = String(formData.get("domains") ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!name || !supportAddress) {
    redirect("/ticket/admin?error=tenant");
  }

  await createTenant({
    name,
    supportAddress,
    domains,
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  redirect("/ticket/admin?tenant=created");
}

export async function toggleTenantStateAction(formData: FormData) {
  const session = await requireMinimumRole(["owner", "manager"]);
  const tenantId = String(formData.get("tenantId") ?? "");
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  await setTenantActiveState({
    tenantId,
    isActive,
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  redirect("/ticket/admin?tenant=updated");
}

export async function createSupportAgentAction(formData: FormData) {
  const session = await requireMinimumRole(["owner"]);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "agent").trim() as
    | "owner"
    | "manager"
    | "agent";
  const headerMap = await headers();

  if (!name || !email) {
    redirect("/ticket/admin?error=agent");
  }

  await createSupportAgent({
    name,
    email,
    role,
    inviteBaseUrl: getAppBaseUrl(headerMap),
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  redirect("/ticket/admin?agent=created");
}

export async function toggleSupportAgentStateAction(formData: FormData) {
  const session = await requireMinimumRole(["owner"]);
  const agentId = String(formData.get("agentId") ?? "");
  const isActive = String(formData.get("isActive") ?? "true") === "true";

  await setSupportAgentActiveState({
    agentId,
    isActive,
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  redirect("/ticket/admin?agent=updated");
}

export async function updateTenantAction(formData: FormData) {
  const session = await requireMinimumRole(["owner", "manager"]);
  const tenantId = String(formData.get("tenantId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const supportAddress = String(formData.get("supportAddress") ?? "").trim();
  const domains = String(formData.get("domains") ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const isActive = formData.get("isActive") === "true";

  if (!tenantId || !name || !supportAddress) {
    redirect(`/ticket/admin/tenants/${tenantId}?error=tenant`);
  }

  await updateTenant({
    tenantId,
    name,
    supportAddress,
    domains,
    isActive,
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  revalidatePath(`/ticket/admin/tenants/${tenantId}`);
  redirect(`/ticket/admin/tenants/${tenantId}?updated=1`);
}

export async function updateSupportAgentAction(formData: FormData) {
  const session = await requireMinimumRole(["owner"]);
  const agentId = String(formData.get("agentId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "agent") as
    | "owner"
    | "manager"
    | "agent";
  const isActive = formData.get("isActive") === "true";

  if (!agentId || !name) {
    redirect(`/ticket/admin/team/${agentId}?error=agent`);
  }

  await updateSupportAgent({
    agentId,
    name,
    role,
    isActive,
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  revalidatePath(`/ticket/admin/team/${agentId}`);
  redirect(`/ticket/admin/team/${agentId}?updated=1`);
}

export async function syncMailboxAction() {
  await requireAdminSession();
  await syncInbox();
  revalidatePath("/ticket/admin");
  redirect("/ticket/admin?sync=done");
}

export async function updateTicketAction(formData: FormData) {
  const session = await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  const status = String(formData.get("status") ?? "open") as
    | "new"
    | "open"
    | "waiting_customer"
    | "resolved"
    | "closed";
  const priority = String(formData.get("priority") ?? "normal") as
    | "low"
    | "normal"
    | "high"
    | "critical";
  const assigneeId = String(formData.get("assigneeId") ?? "").trim();
  const resolutionNote = String(formData.get("resolutionNote") ?? "");

  await updateTicket({
    ticketId,
    status,
    priority,
    assigneeId,
    resolutionNote,
    adminEmail: session.email,
  });

  revalidatePath(`/ticket/admin/tickets/${ticketId}`);
  revalidatePath("/ticket/admin");
  revalidatePath("/ticket/admin", "layout");
  redirect(`/ticket/admin/tickets/${ticketId}?updated=1`);
}

export async function addTicketMessageAction(formData: FormData) {
  const session = await requireAdminSession();
  const ticketId = String(formData.get("ticketId") ?? "");
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  const direction = String(formData.get("direction") ?? "internal") as
    | "internal"
    | "outbound";

  if (!bodyText) {
    redirect(`/ticket/admin/tickets/${ticketId}?error=message`);
  }

  await addTicketMessage({
    ticketId,
    bodyText,
    direction,
    adminEmail: session.email,
  });

  revalidatePath(`/ticket/admin/tickets/${ticketId}`);
  revalidatePath("/ticket/admin");
  revalidatePath("/ticket/admin", "layout");
  redirect(`/ticket/admin/tickets/${ticketId}?message=sent`);
}

export async function completeInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token || !password || password !== confirmPassword) {
    redirect(`/ticket/activate?token=${token}&error=invalid`);
  }

  const session = await activateSupportAgent({
    token,
    password,
  });

  if (!session) {
    redirect(`/ticket/activate?token=${token}&error=expired`);
  }

  await createAdminSession(session);
  redirect("/ticket/admin");
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireAdminSession();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const nextPassword = String(formData.get("nextPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !nextPassword || nextPassword !== confirmPassword) {
    redirect("/ticket/admin/account?error=password");
  }

  const result = await changeSupportAgentPassword({
    agentId: session.userId,
    currentPassword,
    nextPassword,
  });

  if (!result.success) {
    redirect("/ticket/admin/account?error=password");
  }

  redirect("/ticket/admin/account?updated=1");
}
