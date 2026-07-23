import type { FullRequestInput } from "@/lib/validation";

export interface AiReviewResult {
  summary: string;
  category: string;
  estimated_purchase_size: string;
  clarity_score: number;
  seriousness_score: number;
  profitability_score: number;
  risk_flags: string[];
  recommended_questions: string[];
  recommendation: "pursue" | "manually_review" | "not_a_fit";
  overall_score: number;
}

const AI_SCHEMA = `{
  "summary": "string",
  "category": "string",
  "estimated_purchase_size": "string",
  "clarity_score": 1-10,
  "seriousness_score": 1-10,
  "profitability_score": 1-10,
  "risk_flags": ["string"],
  "recommended_questions": ["string"],
  "recommendation": "pursue|manually_review|not_a_fit"
}`;

export async function runAiReview(input: FullRequestInput): Promise<AiReviewResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey });

    const prompt = `You are a sourcing qualification assistant for NeedItz, a B2B sourcing service.

Review this procurement request and return a JSON object matching this schema:
${AI_SCHEMA}

Request details:
- What they need: ${input.item_request}
- Budget: ${input.budget}
- Deadline: ${input.deadline_is_flexible ? "Flexible" : input.deadline}
- Delivery location: ${input.delivery_location}
- Company: ${input.company_name || "Not provided"}
- Additional details: ${input.additional_details || "None"}

Rules:
- Do not promise fulfillment or contact suppliers.
- Do not reject the customer automatically — only flag for admin review.
- Keep summary under 150 words.
- overall_score = average of clarity, seriousness, profitability scores rounded to 1 decimal.
- Return only valid JSON, no markdown.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AiReviewResult>;

    const result: AiReviewResult = {
      summary: String(parsed.summary ?? ""),
      category: String(parsed.category ?? ""),
      estimated_purchase_size: String(parsed.estimated_purchase_size ?? ""),
      clarity_score: clamp(Number(parsed.clarity_score), 1, 10),
      seriousness_score: clamp(Number(parsed.seriousness_score), 1, 10),
      profitability_score: clamp(Number(parsed.profitability_score), 1, 10),
      risk_flags: Array.isArray(parsed.risk_flags) ? parsed.risk_flags.map(String) : [],
      recommended_questions: Array.isArray(parsed.recommended_questions)
        ? parsed.recommended_questions.map(String)
        : [],
      recommendation: ["pursue", "manually_review", "not_a_fit"].includes(
        parsed.recommendation as string
      )
        ? (parsed.recommendation as AiReviewResult["recommendation"])
        : "manually_review",
      overall_score:
        Math.round(
          ((clamp(Number(parsed.clarity_score), 1, 10) +
            clamp(Number(parsed.seriousness_score), 1, 10) +
            clamp(Number(parsed.profitability_score), 1, 10)) /
            3) *
            10
        ) / 10,
    };

    return result;
  } catch (err) {
    console.error("[aiReview] Error:", err instanceof Error ? err.message : err);
    return null;
  }
}

function clamp(val: number, min: number, max: number): number {
  if (isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}
