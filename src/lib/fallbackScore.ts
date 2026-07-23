/**
 * Rules-based fallback scoring when OpenAI is unavailable.
 * Returns a score 1–10.
 */
export function computeFallbackScore(params: {
  itemRequest: string;
  budget: string;
  budgetNumeric: number | null;
  deadline: string | null;
  deadlineIsFlexible: boolean;
  companyName: string | null | undefined;
  additionalDetails: string | null | undefined;
}): number {
  let score = 0;

  // Detail length (up to 3 pts)
  const len = params.itemRequest.length;
  if (len >= 200) score += 3;
  else if (len >= 100) score += 2;
  else if (len >= 30) score += 1;

  // Budget present and substantial (up to 3 pts)
  if (params.budgetNumeric !== null) {
    if (params.budgetNumeric >= 250_000) score += 3;
    else if (params.budgetNumeric >= 50_000) score += 2;
    else if (params.budgetNumeric >= 5_000) score += 1;
  } else if (params.budget.toLowerCase() !== "not sure") {
    score += 0.5;
  }

  // Deadline specified (1 pt)
  if (params.deadline || params.deadlineIsFlexible) score += 1;

  // Company name (1 pt)
  if (params.companyName && params.companyName.trim().length > 1) score += 1;

  // Additional details (1 pt)
  if (params.additionalDetails && params.additionalDetails.trim().length > 20) score += 1;

  // Quantity mentioned (1 pt)
  if (/\b\d+\s*(units?|pieces?|pallets?|trucks?|cases?|boxes?|sets?|pairs?)\b/i.test(params.itemRequest)) {
    score += 1;
  }

  return Math.min(10, Math.round(score));
}
