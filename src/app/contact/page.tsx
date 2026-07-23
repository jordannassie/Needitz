"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { contactSchema } from "@/lib/validation";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const err of result.error.issues) {
        const k = err.path[0] as string;
        if (!errs[k]) errs[k] = err.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setServerError(d.error ?? "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setServerError("A network error occurred. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <>
      <Header />
      <main id="main-content" className="px-5 py-12">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-8">
          <div>
            <h1 className="text-[32px] font-black text-[#050505] leading-tight mb-2">Contact</h1>
            <p className="text-[#5E6168] text-base leading-relaxed">
              Have a question? Send us a message below.
            </p>
            <p className="text-sm text-[#9A9DA5] mt-1">
              For existing requests, include your Request ID in the message.
            </p>
          </div>

          {sent ? (
            <div className="bg-[#F7F7F7] rounded-2xl px-6 py-8 text-center">
              <p className="text-lg font-black text-[#050505] mb-2">Message sent!</p>
              <p className="text-[#5E6168] text-sm">We'll get back to you as soon as we can.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <Field id="full_name" label="Name" type="text" value={form.full_name} error={errors.full_name}
                onChange={(v) => { setForm((f) => ({ ...f, full_name: v })); if (errors.full_name) setErrors((e) => ({ ...e, full_name: "" })); }} />
              <Field id="email" label="Email Address" type="email" value={form.email} error={errors.email}
                onChange={(v) => { setForm((f) => ({ ...f, email: v })); if (errors.email) setErrors((e) => ({ ...e, email: "" })); }} />
              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea id="message" value={form.message} onChange={(e) => { setForm((f) => ({ ...f, message: e.target.value })); if (errors.message) setErrors((e2) => ({ ...e2, message: "" })); }}
                  placeholder="Message" rows={5} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined}
                  className={`w-full border rounded-xl bg-white text-[#050505] text-base px-4 py-3 resize-none transition-all focus:border-[#FFC400] focus:outline-none ${errors.message ? "border-red-400" : "border-[#D8D8D8]"}`} />
                {errors.message && <p id="message-error" role="alert" className="text-sm text-red-500">{errors.message}</p>}
              </div>

              {serverError && <p role="alert" className="text-sm text-red-500">{serverError}</p>}

              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

function Field({ id, label, type, value, error, onChange }: { id: string; label: string; type: string; value: string; error?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        className={`input-field ${error ? "error" : ""}`} />
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
