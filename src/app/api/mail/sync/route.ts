import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth";
import { syncInbox } from "@/lib/data";

export const runtime = "nodejs";

export async function POST() {
  await requireAdminSession();
  const result = await syncInbox();
  return NextResponse.json(result);
}
