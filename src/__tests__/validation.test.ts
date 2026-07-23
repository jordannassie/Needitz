import { describe, it, expect } from "vitest";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from "@/lib/validation";

describe("step1Schema", () => {
  it("accepts valid request", () => {
    const r = step1Schema.safeParse({ item_request: "25 commercial refrigerators" });
    expect(r.success).toBe(true);
  });
  it("rejects too short", () => {
    expect(step1Schema.safeParse({ item_request: "stuff" }).success).toBe(false);
  });
  it("rejects too long", () => {
    expect(step1Schema.safeParse({ item_request: "a".repeat(501) }).success).toBe(false);
  });
});

describe("step2Schema", () => {
  it("accepts dollar amount", () => {
    expect(step2Schema.safeParse({ budget: "$250,000" }).success).toBe(true);
  });
  it("accepts not sure", () => {
    expect(step2Schema.safeParse({ budget: "Not sure" }).success).toBe(true);
  });
  it("rejects empty", () => {
    expect(step2Schema.safeParse({ budget: "" }).success).toBe(false);
  });
});

describe("step3Schema", () => {
  it("accepts a date", () => {
    expect(step3Schema.safeParse({ deadline: "2025-12-01", deadline_is_flexible: false }).success).toBe(true);
  });
  it("accepts flexible", () => {
    expect(step3Schema.safeParse({ deadline: "", deadline_is_flexible: true }).success).toBe(true);
  });
  it("rejects neither date nor flexible", () => {
    expect(step3Schema.safeParse({ deadline: "", deadline_is_flexible: false }).success).toBe(false);
  });
});

describe("step4Schema", () => {
  it("accepts valid location", () => {
    expect(step4Schema.safeParse({ delivery_location: "Dallas, TX" }).success).toBe(true);
  });
  it("rejects empty", () => {
    expect(step4Schema.safeParse({ delivery_location: "" }).success).toBe(false);
  });
});

describe("step5Schema", () => {
  it("accepts full valid contact info", () => {
    expect(step5Schema.safeParse({
      full_name: "Jane Smith",
      email: "jane@example.com",
      phone: "5551234567",
    }).success).toBe(true);
  });
  it("rejects invalid email", () => {
    expect(step5Schema.safeParse({
      full_name: "Jane Smith",
      email: "notanemail",
      phone: "5551234567",
    }).success).toBe(false);
  });
});

describe("step6Schema", () => {
  it("accepts valid submission with both checkboxes", () => {
    expect(step6Schema.safeParse({
      confirmed_legitimate: true,
      agreed_to_terms: true,
    }).success).toBe(true);
  });
  it("rejects unchecked legitimate", () => {
    expect(step6Schema.safeParse({
      confirmed_legitimate: false,
      agreed_to_terms: true,
    }).success).toBe(false);
  });
  it("rejects unchecked terms", () => {
    expect(step6Schema.safeParse({
      confirmed_legitimate: true,
      agreed_to_terms: false,
    }).success).toBe(false);
  });
});
