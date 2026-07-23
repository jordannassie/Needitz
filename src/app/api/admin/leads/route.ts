import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAllLeads } from "@/lib/leadsStore";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await getAllLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    console.error("[api/admin/leads] Load error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Unable to load leads. Please refresh and try again." },
      { status: 500 }
    );
  }
}
