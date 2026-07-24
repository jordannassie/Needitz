import { z } from "zod";

export const step1Schema = z.object({
  item_request: z
    .string()
    .min(10, "Please describe what you need (at least 10 characters).")
    .max(500, "Description must be 500 characters or fewer."),
});

export const step2Schema = z.object({
  budget: z
    .string()
    .min(1, "Please enter a budget or select 'Not sure'.")
    .max(200, "Budget entry is too long."),
});

const step3Base = z.object({
  deadline: z.string().optional(),
  deadline_is_flexible: z.boolean(),
});

export const step3Schema = step3Base.refine(
  (d) => d.deadline_is_flexible || (d.deadline && d.deadline.length > 0),
  { message: "Please select a date or mark as flexible.", path: ["deadline"] }
);

export const step4Schema = z.object({
  delivery_location: z
    .string()
    .min(2, "Please enter a delivery location.")
    .max(200, "Location is too long."),
});

export const step5Schema = z.object({
  full_name: z.string().min(2, "Full name is required.").max(200),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .min(7, "Phone number is required.")
    .max(50, "Phone number is too long."),
  company_name: z.string().max(200).optional(),
});

// Validates the reference_links_raw field (raw multiline textarea string).
// Parsing into a clean string[] is done in the API route after validation.
export const referenceLinkSchema = z
  .string()
  .max(2000, "Reference links must be 2,000 characters or fewer.")
  .optional();

export const step6Schema = z.object({
  additional_details: z.string().max(300, "Must be 300 characters or fewer.").optional(),
  reference_links_raw: referenceLinkSchema,
});

export const fullRequestSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Base)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .extend({
    source: z.string().optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
  });

export type FullRequestInput = z.infer<typeof fullRequestSchema>;

export const contactSchema = z.object({
  full_name: z.string().min(2, "Name is required.").max(200),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters.").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Reference link utilities ─────────────────────────────────────────────

/** Allowed protocols for reference links. */
const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

/** Parse raw multiline text into a validated, clean URL array.
 *  Returns { links, error } — error is set when any line is invalid. */
export function parseReferenceLinks(raw: string | undefined): {
  links: string[];
  error: string | null;
} {
  if (!raw || raw.trim() === "") return { links: [], error: null };

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length > 10) {
    return { links: [], error: "A maximum of 10 reference links is allowed." };
  }

  const invalid: string[] = [];
  const links: string[] = [];

  for (const line of lines) {
    try {
      const url = new URL(line);
      if (!SAFE_PROTOCOLS.has(url.protocol)) {
        invalid.push(line);
      } else {
        links.push(url.href);
      }
    } catch {
      invalid.push(line);
    }
  }

  if (invalid.length > 0) {
    return {
      links: [],
      error: "Please enter valid web links beginning with http:// or https://.",
    };
  }

  return { links, error: null };
}
