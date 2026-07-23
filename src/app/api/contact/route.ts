import { NextResponse } from "next/server";

/**
 * Contact form is currently disabled — submissions are not stored.
 * The contact page shows a mailto link instead.
 */
export async function POST() {
  return NextResponse.json({ success: true });
}
