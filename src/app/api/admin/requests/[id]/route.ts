import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";
import type { RequestRow } from "@/types/database";
import { z } from "zod";

const updateSchema = z.object({
  status: z
    .enum(["new", "reviewing", "needs_information", "potential_match", "accepted", "not_a_fit", "closed"])
    .optional(),
  priority: z.enum(["normal", "high", "urgent"]).optional(),
  admin_notes: z.string().max(5000).optional(),
  viewed_at: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed." }, { status: 400 });
  }

  const db = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("requests") as any)
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db.from("requests") as any).select("*").eq("id", id).single();
  if (error) {
    return NextResponse.json({ error: (error as { message: string }).message }, { status: 404 });
  }

  // Mark as viewed
  const rowData = data as RequestRow;
  if (!rowData.viewed_at) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.from("requests") as any)
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", id)
      .then(() => {});
  }

  return NextResponse.json({ request: rowData });
}
