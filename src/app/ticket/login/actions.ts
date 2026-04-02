"use server";

import { redirect } from "next/navigation";

import { createAdminSession } from "@/lib/auth";
import { verifyAdminLogin } from "@/lib/data";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const admin = await verifyAdminLogin(email, password);

  if (!admin) {
    redirect("/ticket/login?error=invalid");
  }

  await createAdminSession(admin);
  redirect("/ticket/admin");
}
