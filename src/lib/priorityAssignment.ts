export type RequestPriority = "normal" | "high" | "urgent";

export function assignPriority(budgetNumeric: number | null): RequestPriority {
  if (budgetNumeric === null) return "normal";
  if (budgetNumeric >= 250_000) return "urgent";
  if (budgetNumeric >= 50_000) return "high";
  return "normal";
}
