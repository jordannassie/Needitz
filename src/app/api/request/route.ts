import { NextRequest, NextResponse } from "next/server";
import { fullRequestSchema } from "@/lib/validation";
import { isProhibitedRequest } from "@/lib/prohibited";
import { parseBudgetNumeric } from "@/lib/budgetParser";
import { assignPriority } from "@/lib/priorityAssignment";
import { generateRequestNumber } from "@/lib/requestId";
import { sanitizeRecord } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rateLimit";
import { runAiReview } from "@/lib/aiReview";
import { computeFallbackScore } from "@/lib/fallbackScore";
import { sendEmail } from "@/lib/mailer";
import { buildCustomerConfirmationEmail } from "@/lib/emails/customerConfirmation";
import { buildAdminNotificationEmail } from "@/lib/emails/adminNotification";
import { createServiceClient } from "@/lib/supabase";
import type { RequestRow } from "@/types/database";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Rate limiting
  const rateCheck = checkRateLimit(`request:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  // Validate
  const parsed = fullRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const data = sanitizeRecord(parsed.data) as typeof parsed.data;

  // Prohibited check
  const combinedText = `${data.item_request} ${data.additional_details ?? ""}`;
  if (isProhibitedRequest(combinedText)) {
    return NextResponse.json(
      { success: false, error: "This request cannot be submitted through NeedItz." },
      { status: 422 }
    );
  }

  const budgetNumeric = parseBudgetNumeric(data.budget);
  const priority = assignPriority(budgetNumeric);
  const requestNumber = generateRequestNumber();

  // AI review (non-blocking fail)
  const aiResult = await runAiReview(data).catch(() => null);

  // Fallback score
  const fallbackScore = aiResult
    ? null
    : computeFallbackScore({
        itemRequest: data.item_request,
        budget: data.budget,
        budgetNumeric,
        deadline: data.deadline ?? null,
        deadlineIsFlexible: data.deadline_is_flexible,
        companyName: data.company_name,
        additionalDetails: data.additional_details,
      });

  // Build DB row
  const row: Omit<RequestRow, "id" | "created_at" | "updated_at"> = {
    request_number: requestNumber,
    item_request: data.item_request,
    budget: data.budget,
    budget_numeric: budgetNumeric,
    deadline: data.deadline ?? null,
    deadline_is_flexible: data.deadline_is_flexible,
    delivery_location: data.delivery_location,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    company_name: data.company_name ?? null,
    additional_details: data.additional_details ?? null,
    confirmed_legitimate: data.confirmed_legitimate as boolean,
    agreed_to_terms: data.agreed_to_terms as boolean,
    status: "new",
    priority,
    ai_summary: aiResult?.summary ?? null,
    ai_score: aiResult?.overall_score ?? null,
    ai_category: aiResult?.category ?? null,
    ai_clarity_score: aiResult?.clarity_score ?? null,
    ai_seriousness_score: aiResult?.seriousness_score ?? null,
    ai_profitability_score: aiResult?.profitability_score ?? null,
    ai_risk_flags: aiResult?.risk_flags ?? null,
    ai_recommended_questions: aiResult?.recommended_questions ?? null,
    ai_recommendation: aiResult?.recommendation ?? null,
    fallback_score: fallbackScore,
    admin_notes: null,
    source: data.source ?? "web",
    utm_source: data.utm_source ?? null,
    utm_medium: data.utm_medium ?? null,
    utm_campaign: data.utm_campaign ?? null,
    blocked: false,
    viewed_at: null,
  };

  // Store in DB
  let dbClient: ReturnType<typeof createServiceClient> | null = null;
  try {
    dbClient = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (dbClient.from("requests") as any).insert(row);
    if (dbError) throw new Error((dbError as { message: string }).message);
  } catch (dbErr) {
    console.error("[api/request] DB error:", dbErr instanceof Error ? dbErr.message : dbErr);
    return NextResponse.json(
      { success: false, error: "Failed to save your request. Please try again." },
      { status: 500 }
    );
  }

  // Retrieve the stored row (for emails)
  let storedRow: RequestRow | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (dbClient!.from("requests") as any)
      .select("*")
      .eq("request_number", requestNumber)
      .single();
    storedRow = rows as RequestRow;
  } catch {
    storedRow = { ...row, id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RequestRow;
  }

  const emailRow = storedRow ?? ({ ...row, id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as RequestRow);

  // Send emails (non-blocking fail)
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    const { subject: cs, html: ch, text: ct } = buildCustomerConfirmationEmail(emailRow);
    sendEmail({ to: data.email, subject: cs, html: ch, text: ct }).catch((e) =>
      console.error("[api/request] Customer email failed:", e instanceof Error ? e.message : e)
    );

    if (adminEmail) {
      const { subject: as, html: ah, text: at } = buildAdminNotificationEmail(emailRow);
      sendEmail({ to: adminEmail, subject: as, html: ah, text: at }).catch((e) =>
        console.error("[api/request] Admin email failed:", e instanceof Error ? e.message : e)
      );
    }
  }

  return NextResponse.json({ success: true, requestNumber }, { status: 201 });
}
