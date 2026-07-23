import { describe, it, expect } from "vitest";
import { generateRequestNumber } from "@/lib/requestId";

describe("generateRequestNumber", () => {
  it("returns a string matching NI-YYMMDD-XXXX format", () => {
    const id = generateRequestNumber();
    expect(id).toMatch(/^NI-\d{6}-\d{4}$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestNumber()));
    // With 9000 possible 4-digit suffixes, 100 calls should be overwhelmingly unique
    expect(ids.size).toBeGreaterThan(80);
  });
});
