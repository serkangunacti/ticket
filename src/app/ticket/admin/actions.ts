"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, requireAdminSession } from "@/lib/auth";
import {
  addTicketMessage,
  createSupportAgent,
  createTenant,
  setSupportAgentActiveState,
  setTenantActiveState,
  syncInbox,
  updateTicket,
} from "@/lib/data";

export async function logoutAction() {
  await clearAdminSession();
  redirect("/ticket/login");
}

export async function createTenantAction(formData: FormData) {
  const session = await requireAdminSession();
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
  const session = await requireAdminSession();
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
  const session = await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    redirect("/ticket/admin?error=agent");
  }

  await createSupportAgent({
    name,
    email,
    adminEmail: session.email,
  });

  revalidatePath("/ticket/admin");
  redirect("/ticket/admin?agent=created");
}

export async function toggleSupportAgentStateAction(formData: FormData) {
  const session = await requireAdminSession();
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
