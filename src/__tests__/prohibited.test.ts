import { describe, it, expect } from "vitest";
import { isProhibitedRequest } from "@/lib/prohibited";

describe("isProhibitedRequest", () => {
  it("flags firearms", () => {
    expect(isProhibitedRequest("I need 50 firearms for my store")).toBe(true);
    expect(isProhibitedRequest("pistols in bulk")).toBe(true);
    expect(isProhibitedRequest("AR-15 rifles")).toBe(true);
  });

  it("flags ammunition", () => {
    expect(isProhibitedRequest("1000 rounds of ammunition")).toBe(true);
    expect(isProhibitedRequest("bulk ammo")).toBe(true);
  });

  it("flags drugs", () => {
    expect(isProhibitedRequest("need 5kg of cocaine")).toBe(true);
    expect(isProhibitedRequest("fentanyl patches")).toBe(true);
  });

  it("does not flag legitimate requests", () => {
    expect(isProhibitedRequest("25 commercial refrigerators for Dallas")).toBe(false);
    expect(isProhibitedRequest("50 office chairs delivered to NYC within 30 days")).toBe(false);
    expect(isProhibitedRequest("industrial cleaning equipment")).toBe(false);
    expect(isProhibitedRequest("3 food trucks for event")).toBe(false);
  });
});
