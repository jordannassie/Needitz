import { describe, it, expect } from "vitest";
import { computeFallbackScore } from "@/lib/fallbackScore";

const base = {
  itemRequest: "I need 25 commercial refrigerators delivered to Dallas within 30 days.",
  budget: "$250,000",
  budgetNumeric: 250_000,
  deadline: "2025-12-01",
  deadlineIsFlexible: false,
  companyName: "Acme Corp",
  additionalDetails: "Must be stainless steel, Energy Star rated, 48 cubic feet each.",
};

describe("computeFallbackScore", () => {
  it("returns a number between 1 and 10", () => {
    const score = computeFallbackScore(base);
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(10);
  });

  it("scores high for complete, detailed requests", () => {
    const score = computeFallbackScore(base);
    expect(score).toBeGreaterThanOrEqual(7);
  });

  it("scores lower for minimal requests", () => {
    const score = computeFallbackScore({
      itemRequest: "I need something",
      budget: "not sure",
      budgetNumeric: null,
      deadline: null,
      deadlineIsFlexible: false,
      companyName: null,
      additionalDetails: null,
    });
    expect(score).toBeLessThanOrEqual(4);
  });
});
