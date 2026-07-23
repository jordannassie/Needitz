import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { sanitizeRecord } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rateLimit";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const rateCheck = checkRateLimit(`contact:${ip}`, 3, 10 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const data = sanitizeRecord(parsed.data);

  try {
    const db = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.from("contact_messages") as any).insert({
      full_name: data.full_name,
      email: data.email,
      message: data.message,
      request_id_ref: null,
    });
  } catch (err) {
    console.error("[api/contact] DB error:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ success: true });
}
