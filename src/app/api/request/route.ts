import { NextRequest, NextResponse } from "next/server";
import { fullRequestSchema } from "@/lib/validation";
import { isProhibitedRequest } from "@/lib/prohibited";
import { generateRequestNumber } from "@/lib/requestId";
import { sanitizeRecord } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rateLimit";
import { saveLead } from "@/lib/leadsStore";
import type { Lead } from "@/types/lead";
import { defaultLeadExtensions } from "@/types/lead";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 min per IP

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { allowed } = checkRateLimit(`request:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = fullRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const data = sanitizeRecord(parsed.data) as typeof parsed.data;

  const combinedText = `${data.item_request} ${data.additional_details ?? ""}`;
  if (isProhibitedRequest(combinedText)) {
    return NextResponse.json(
      { success: false, error: "This request cannot be submitted through NeedItz." },
      { status: 422 }
    );
  }

  const requestId = generateRequestNumber();
  const now = new Date().toISOString();

  const lead: Lead = {
    id: crypto.randomUUID(),
    requestId,
    itemRequest: data.item_request,
    budget: data.budget,
    deadline: data.deadline ?? null,
    deadlineIsFlexible: data.deadline_is_flexible,
    deliveryLocation: data.delivery_location,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    companyName: data.company_name ?? "",
    additionalDetails: data.additional_details ?? "",
    status: "new",
    isViewed: false,
    createdAt: now,
    updatedAt: now,
    internalNotes: "",
    ...defaultLeadExtensions(),
  };

  try {
    await saveLead(lead);
  } catch (err) {
    console.error("[api/request] Storage error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "We couldn't submit your request. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, requestId }, { status: 201 });
}
