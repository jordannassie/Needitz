import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getLead, updateLead, deleteLead, addManualSupplier, updateChecklist } from "@/lib/leadsStore";
import { z } from "zod";

const patchSchema = z.object({
  status: z
    .enum(["new", "reviewing", "contacted", "potential", "not_a_fit", "closed"])
    .optional(),
  isViewed: z.boolean().optional(),
  internalNotes: z.string().max(5000).optional(),
  reportFeedback: z.enum(["helpful", "not_helpful"]).nullable().optional(),
  reportFeedbackNote: z.string().max(1000).nullable().optional(),
});

const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
});

const manualSupplierSchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().max(200).optional().default(""),
  companyType: z.string().max(100).optional().default("unknown"),
  location: z.string().max(200).nullable().optional().default(null),
  relevance: z.string().max(500).optional().default(""),
  apparentOffering: z.string().max(500).optional().default(""),
  confidence: z.enum(["high", "medium", "low"]).optional().default("medium"),
  verificationStatus: z
    .enum(["public_source_found", "requires_verification", "possible_match_only"])
    .optional()
    .default("requires_verification"),
  sourceUrl: z.string().optional().default(""),
  addedBy: z.literal("manual"),
  contactName: z.string().max(200).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().max(200).optional(),
  manualNotes: z.string().max(2000).optional(),
  manualStatus: z.string().max(100).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const lead = await getLead(id);
    if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (err) {
    console.error("[api/admin/leads/GET]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to load lead." }, { status: 500 });
  }
}

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

  // Handle checklist updates
  if (
    typeof body === "object" &&
    body !== null &&
    "researchChecklist" in body
  ) {
    const checklistParsed = z.array(checklistItemSchema).safeParse((body as Record<string, unknown>).researchChecklist);
    if (!checklistParsed.success) {
      return NextResponse.json({ error: "Invalid checklist." }, { status: 400 });
    }
    try {
      const updated = await updateChecklist(id, checklistParsed.data);
      if (!updated) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
      return NextResponse.json({ lead: updated });
    } catch (err) {
      console.error("[api/admin/leads/PATCH checklist]", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "Failed to update." }, { status: 500 });
    }
  }

  // Handle manual supplier addition
  if (
    typeof body === "object" &&
    body !== null &&
    "addManualSupplier" in body
  ) {
    const supplierParsed = manualSupplierSchema.safeParse(
      (body as Record<string, unknown>).addManualSupplier
    );
    if (!supplierParsed.success) {
      return NextResponse.json({ error: "Invalid supplier data." }, { status: 400 });
    }
    try {
      const updated = await addManualSupplier(id, supplierParsed.data);
      if (!updated) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
      return NextResponse.json({ lead: updated });
    } catch (err) {
      console.error("[api/admin/leads/PATCH supplier]", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: "Failed to update." }, { status: 500 });
    }
  }

  // Standard patch
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
