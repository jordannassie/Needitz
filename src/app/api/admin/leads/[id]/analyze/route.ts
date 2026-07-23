import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getLead, markLeadAnalyzing, saveAiReport, markLeadAnalysisFailed } from "@/lib/leadsStore";
import { runAiAnalysis, isOpenAiConfigured } from "@/lib/aiAnalysis";
import { checkRateLimit } from "@/lib/rateLimit";

// Allow up to 90 seconds for web research + analysis
export const maxDuration = 90;

// Track in-flight analysis requests (prevents duplicate concurrent runs)
const inFlight = new Set<string>();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // OpenAI configured?
  if (!isOpenAiConfigured()) {
    return NextResponse.json(
      { error: "OpenAI analysis is unavailable because OPENAI_API_KEY is not configured." },
      { status: 503 }
    );
  }

  // Rate limit: 10 analysis requests per 10 minutes (keyed by a truncated cookie to identify session)
  const cookieHeader = req.headers.get("cookie") ?? "anon";
  const rateKey = `analyze:${cookieHeader.slice(0, 64)}`;
  const { allowed } = checkRateLimit(rateKey, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many analysis requests. Please wait a few minutes." },
      { status: 429 }
    );
  }

  // Prevent duplicate concurrent runs for the same lead
  if (inFlight.has(id)) {
    return NextResponse.json(
      { error: "Analysis is already running for this lead." },
      { status: 409 }
    );
  }

  // Verify lead exists — use stored data only (never trust browser input)
  const lead = await getLead(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  inFlight.add(id);

  try {
    // Mark as analyzing so the UI can show the in-progress state
    await markLeadAnalyzing(id);

    // Run the analysis (web research + structured AI output)
    const report = await runAiAnalysis(lead);

    // Save report — preserves previous report if this call fails after this line
    const updatedLead = await saveAiReport(id, report, report.model);
    if (!updatedLead) {
      return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
    }

    return NextResponse.json({ success: true, lead: updatedLead }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed.";
    console.error(`[analyze] Lead ${id} analysis failed:`, message);

    // Mark failed — preserves any existing report
    await markLeadAnalysisFailed(id, message).catch(() => null);

    return NextResponse.json(
      {
        error: "AI analysis failed. Please try again.",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  } finally {
    inFlight.delete(id);
  }
}
