import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAllLeads } from "@/lib/leadsStore";

/** Wrap a value in double quotes, escaping any internal double quotes. */
function csvCell(value: unknown): string {
  const str =
    value === null || value === undefined
      ? ""
      : typeof value === "boolean"
      ? value ? "Yes" : "No"
      : String(value);
  // Escape double quotes by doubling them, then wrap the whole cell in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

const HEADERS = [
  "Request ID",
  "Submitted Date",
  "Full Name",
  "Company",
  "Email",
  "Phone",
  "Request",
  "Budget",
  "Deadline",
  "Delivery Location",
  "Additional Details",
  "Status",
  "Viewed",
  "Internal Notes",
  "AI Opportunity Score",
  "AI Recommendation",
  "AI Decision",
  "AI Report Generated",
];

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let leads;
  try {
    leads = await getAllLeads();
  } catch (err) {
    console.error("[api/admin/export]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to load leads." }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `needitz-leads-${today}.csv`;

  const rows: string[] = [csvRow(HEADERS)];

  for (const lead of leads) {
    const deadline = lead.deadlineIsFlexible
      ? "Flexible"
      : lead.deadline ?? "";

    rows.push(
      csvRow([
        lead.requestId,
        lead.createdAt,
        lead.fullName,
        lead.companyName,
        lead.email,
        lead.phone,
        lead.itemRequest,
        lead.budget,
        deadline,
        lead.deliveryLocation,
        lead.additionalDetails,
        lead.status,
        lead.isViewed,
        lead.internalNotes,
        lead.aiReport?.opportunityScore ?? "",
        lead.aiReport?.recommendation ?? "",
        lead.aiReport?.decision ?? "",
        lead.aiReportGeneratedAt ?? "",
      ])
    );
  }

  const csv = rows.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Prevent caching so each download reflects current data
      "Cache-Control": "no-store",
    },
  });
}
