/**
 * Safely extracts a numeric estimate from a budget string.
 * Returns null if no meaningful number can be extracted.
 * Never rejects a submission — this is advisory only.
 */
export function parseBudgetNumeric(budget: string): number | null {
  if (!budget) return null;
  const lower = budget.toLowerCase().trim();
  if (lower === "not sure" || lower === "unsure" || lower === "unknown") return null;

  // Strip currency symbols and commas
  const cleaned = budget.replace(/[$,\s]/g, "");

  // Handle ranges like "200000-300000" or "200000–300000"
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)[–\-](\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return Math.round((low + high) / 2);
  }

  // Handle "under 50000" / "up to 50000"
  const underMatch = cleaned.match(/(?:under|upto|lessthan)(\d+(?:\.\d+)?)/i);
  if (underMatch) return parseFloat(underMatch[1]);

  // Handle direct numbers
  const directMatch = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (directMatch) return parseFloat(directMatch[1]);

  // Handle k/m notation
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)k$/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const mMatch = cleaned.match(/^(\d+(?:\.\d+)?)m$/i);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;

  return null;
}
