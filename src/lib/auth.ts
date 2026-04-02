import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

import { env } from "@/lib/env";
import type { SupportRole } from "@/lib/types";

const SESSION_COOKIE = "uptexx_admin_session";
const secret = new TextEncoder().encode(
  env.AUTH_SECRET ?? "uptexx-local-dev-secret-change-me",
);

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  role: SupportRole;
};

export async function createAdminSession(session: AdminSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const payload = await jwtVerify(token, secret);
    const session = payload.payload as unknown as Partial<AdminSession>;
    if (!session.email || !session.name) return null;
    return {
      userId: session.userId ?? session.email,
      email: session.email,
      name: session.name,
      role: session.role ?? "owner",
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/ticket/login");
  }
  return session;
}

export async function requireMinimumRole(roles: SupportRole[]) {
  const session = await requireAdminSession();
  if (!roles.includes(session.role)) {
    redirect("/ticket/admin?error=permission");
  }
  return session;
}
