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

export const step6Schema = z.object({
  additional_details: z.string().max(300, "Must be 300 characters or fewer.").optional(),
  confirmed_legitimate: z.literal(true, "You must confirm this is a legitimate request."),
  agreed_to_terms: z.literal(true, "You must agree to the Terms and Privacy Policy."),
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
