import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

import type { ReportMetrics, TicketFilters, TicketListItem } from "@/lib/types";
import { formatDateTime, formatDurationMinutes } from "@/lib/utils";

export function calculateMetrics(tickets: TicketListItem[]): ReportMetrics {
  const openStatuses = new Set(["new", "open", "waiting_customer"]);
  const closedStatuses = new Set(["resolved", "closed"]);

  const firstResponseSamples = tickets
    .filter((ticket) => ticket.firstResponseAt)
    .map((ticket) =>
      Math.max(
        0,
        Math.round(
          (ticket.firstResponseAt!.getTime() - ticket.firstReceivedAt.getTime()) /
            60000,
        ),
      ),
    );

  const resolutionSamples = tickets
    .filter((ticket) => ticket.resolvedAt)
    .map((ticket) =>
      Math.max(
        0,
        Math.round(
          (ticket.resolvedAt!.getTime() - ticket.firstReceivedAt.getTime()) /
            60000,
        ),
      ),
    );

  return {
    totalTickets: tickets.length,
    openTickets: tickets.filter((ticket) => openStatuses.has(ticket.status)).length,
    closedTickets: tickets.filter((ticket) => closedStatuses.has(ticket.status))
      .length,
    averageFirstResponseMinutes: average(firstResponseSamples),
    averageResolutionMinutes: average(resolutionSamples),
  };
}

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function buildExcelWorkbook(input: {
  tickets: TicketListItem[];
  metrics: ReportMetrics;
  filters: TicketFilters;
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Uptexx Ticket";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 24 },
  ];

  summarySheet.addRows([
    { metric: "Total tickets", value: input.metrics.totalTickets },
    { metric: "Open tickets", value: input.metrics.openTickets },
    { metric: "Closed tickets", value: input.metrics.closedTickets },
    {
      metric: "Average first response",
      value: formatDurationMinutes(input.metrics.averageFirstResponseMinutes),
    },
    {
      metric: "Average resolution",
      value: formatDurationMinutes(input.metrics.averageResolutionMinutes),
    },
  ]);

  const ticketsSheet = workbook.addWorksheet("Tickets");
  ticketsSheet.columns = [
    { header: "Ticket", key: "ticketCode", width: 16 },
    { header: "Tenant", key: "tenantName", width: 24 },
    { header: "Customer", key: "customerEmail", width: 28 },
    { header: "Subject", key: "subject", width: 42 },
    { header: "Priority", key: "priority", width: 14 },
    { header: "Status", key: "status", width: 20 },
    { header: "Opened", key: "firstReceivedAt", width: 22 },
    { header: "First response", key: "firstResponseAt", width: 22 },
    { header: "Resolved", key: "resolvedAt", width: 22 },
    { header: "Resolution note", key: "resolutionNote", width: 42 },
  ];

  for (const ticket of input.tickets) {
    ticketsSheet.addRow({
      ...ticket,
      firstReceivedAt: formatDateTime(ticket.firstReceivedAt),
      firstResponseAt: formatDateTime(ticket.firstResponseAt),
      resolvedAt: formatDateTime(ticket.resolvedAt),
      resolutionNote: ticket.resolutionNote ?? "",
    });
  }

  return workbook.xlsx.writeBuffer();
}

export async function buildPdfBuffer(input: {
  tickets: TicketListItem[];
  metrics: ReportMetrics;
  filters: TicketFilters;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(24).text("Uptexx Monthly Ticket Report");
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#5f6570").text(
      `Generated at ${formatDateTime(new Date(), "en-US")}`,
    );
    doc.moveDown();

    doc.fontSize(16).fillColor("#111827").text("Summary");
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total tickets: ${input.metrics.totalTickets}`);
    doc.text(`Open tickets: ${input.metrics.openTickets}`);
    doc.text(`Closed tickets: ${input.metrics.closedTickets}`);
    doc.text(
      `Average first response: ${formatDurationMinutes(
        input.metrics.averageFirstResponseMinutes,
      )}`,
    );
    doc.text(
      `Average resolution: ${formatDurationMinutes(
        input.metrics.averageResolutionMinutes,
      )}`,
    );

    doc.moveDown();
    doc.fontSize(16).text("Filters");
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Tenant: ${input.filters.tenantId ?? "All"}`);
    doc.text(`Priority: ${input.filters.priority ?? "All"}`);
    doc.text(`Status: ${input.filters.status ?? "All"}`);
    doc.text(`Search: ${input.filters.query ?? "-"}`);

    doc.moveDown();
    doc.fontSize(16).text("Critical tickets");
    doc.moveDown(0.5);

    const criticalTickets = input.tickets.filter(
      (ticket) => ticket.priority === "critical" || ticket.priority === "high",
    );

    if (!criticalTickets.length) {
      doc.fontSize(11).text("No high-priority tickets in selected range.");
    } else {
      criticalTickets.slice(0, 10).forEach((ticket) => {
        doc
          .fontSize(11)
          .fillColor("#111827")
          .text(`${ticket.ticketCode} - ${ticket.subject}`);
        doc
          .fontSize(10)
          .fillColor("#5f6570")
          .text(
            `${ticket.tenantName} | ${ticket.customerEmail} | ${ticket.status.toUpperCase()} | ${formatDateTime(ticket.firstReceivedAt)}`,
          );
        doc.moveDown(0.4);
      });
    }

    doc.end();
  });
}
