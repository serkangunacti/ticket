"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminSession } from "@/lib/auth";
import { verifyAdminLogin } from "@/lib/data";
import { getSiteSettings, slugify } from "@/lib/site-settings";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const admin = await verifyAdminLogin(email, password);

  if (!admin) {
    redirect("/ticket/login?error=invalid");
  }

  await createAdminSession(admin);

  const settings = await getSiteSettings();
  const slug = slugify(settings.companyName);
  const cookieStore = await cookies();
  cookieStore.set("company_slug", slug, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(`/ticket/${slug}`);
}
