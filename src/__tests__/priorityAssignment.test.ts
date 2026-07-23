import { describe, it, expect } from "vitest";
import { assignPriority } from "@/lib/priorityAssignment";

describe("assignPriority", () => {
  it("returns normal for null budget", () => {
    expect(assignPriority(null)).toBe("normal");
  });

  it("returns normal for small amounts", () => {
    expect(assignPriority(100)).toBe("normal");
    expect(assignPriority(49_999)).toBe("normal");
  });

  it("returns high for $50,000–$249,999", () => {
    expect(assignPriority(50_000)).toBe("high");
    expect(assignPriority(100_000)).toBe("high");
    expect(assignPriority(249_999)).toBe("high");
  });

  it("returns urgent for $250,000+", () => {
    expect(assignPriority(250_000)).toBe("urgent");
    expect(assignPriority(1_000_000)).toBe("urgent");
  });
});
