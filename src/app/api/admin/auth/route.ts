import { NextRequest, NextResponse } from "next/server";
import { isPinValid, buildSessionCookieValue, COOKIE_NAME } from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`admin-auth:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { pin } = (await req.json()) as { pin?: string };

  if (!pin || !isPinValid(pin)) {
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, buildSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60, // 8 hours
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
