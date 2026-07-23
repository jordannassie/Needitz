import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";
import type { RequestStatus } from "@/types/database";

const VALID_STATUSES: RequestStatus[] = [
  "new",
  "reviewing",
  "needs_information",
  "potential_match",
  "accepted",
  "not_a_fit",
  "closed",
];

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as RequestStatus | null;
  const priority = searchParams.get("priority");

  const db = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db.from("requests") as any).select("*").order("created_at", { ascending: false });

  if (status && VALID_STATUSES.includes(status)) {
    query = query.eq("status", status);
  }
  if (priority === "high" || priority === "urgent") {
    query = query.eq("priority", priority);
  }

  const { data, error } = await query as { data: unknown; error: { message: string } | null };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data });
}
