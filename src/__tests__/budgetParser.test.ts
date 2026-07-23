import { describe, it, expect } from "vitest";
import { parseBudgetNumeric } from "@/lib/budgetParser";

describe("parseBudgetNumeric", () => {
  it("parses plain numbers", () => {
    expect(parseBudgetNumeric("250000")).toBe(250000);
    expect(parseBudgetNumeric("5000")).toBe(5000);
  });

  it("parses dollar-sign amounts", () => {
    expect(parseBudgetNumeric("$250,000")).toBe(250000);
    expect(parseBudgetNumeric("$1,500,000")).toBe(1500000);
  });

  it("parses ranges and returns midpoint", () => {
    expect(parseBudgetNumeric("$200,000–$300,000")).toBe(250000);
    expect(parseBudgetNumeric("200000-300000")).toBe(250000);
  });

  it("parses k/m notation", () => {
    expect(parseBudgetNumeric("250k")).toBe(250000);
    expect(parseBudgetNumeric("2m")).toBe(2000000);
  });

  it("returns null for 'not sure'", () => {
    expect(parseBudgetNumeric("Not sure")).toBeNull();
    expect(parseBudgetNumeric("not sure")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseBudgetNumeric("")).toBeNull();
  });

  it("returns null for unrecognized text", () => {
    expect(parseBudgetNumeric("around a million maybe")).toBeNull();
  });
});
