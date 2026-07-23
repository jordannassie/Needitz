import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { updateLead, deleteLead } from "@/lib/leadsStore";
import { z } from "zod";

const patchSchema = z.object({
  status: z
    .enum(["new", "reviewing", "contacted", "potential", "not_a_fit", "closed"])
    .optional(),
  isViewed: z.boolean().optional(),
  internalNotes: z.string().max(5000).optional(),
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed." }, { status: 400 });
  }

  try {
    const updated = await updateLead(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }
    return NextResponse.json({ lead: updated });
  } catch (err) {
    console.error("[api/admin/leads/PATCH]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/leads/DELETE]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}
