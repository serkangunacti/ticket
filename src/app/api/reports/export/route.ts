import { requireAdminSession } from "@/lib/auth";
import { buildMonthlyReport, storeMonthlyReportLog } from "@/lib/data";
import type { TicketFilters } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireAdminSession();

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") === "pdf" ? "pdf" : "xlsx") as
    | "xlsx"
    | "pdf";
  const filters: TicketFilters = {
    tenantId: searchParams.get("tenantId") || undefined,
    status: (searchParams.get("status") as TicketFilters["status"]) || undefined,
    priority:
      (searchParams.get("priority") as TicketFilters["priority"]) || undefined,
    query: searchParams.get("query") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  };

  const buffer = await buildMonthlyReport(filters, format);
  const payload = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const tenantId = filters.tenantId ?? "all-tenants";
  const fromDate = filters.from ? new Date(filters.from) : new Date("2026-01-01");
  const toDate = filters.to ? new Date(filters.to) : new Date();

  await storeMonthlyReportLog({
    tenantId,
    fromDate,
    toDate,
    format,
    filters,
  });

  return new Response(payload as unknown as BodyInit, {
    headers: {
      "Content-Type":
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="uptexx-report.${format}"`,
    },
  });
}
