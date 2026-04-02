"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, requireAdminSession } from "@/lib/auth";
import { addTicketMessage, createTenant, syncInbox, updateTicket } from "@/lib/data";

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
  const resolutionNote = String(formData.get("resolutionNote") ?? "");

  await updateTicket({
    ticketId,
    status,
    priority,
    resolutionNote,
    adminEmail: session.email,
  });

  revalidatePath(`/ticket/admin/tickets/${ticketId}`);
  revalidatePath("/ticket/admin");
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
  redirect(`/ticket/admin/tickets/${ticketId}?message=sent`);
}
