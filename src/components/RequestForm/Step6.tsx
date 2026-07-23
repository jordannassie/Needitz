"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step6Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";
import { useRouter } from "next/navigation";

export function Step6() {
  const { formData, updateFormData, setStep, clearForm } = useFormContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const MAX = 300;
  const count = formData.additional_details.length;

  async function handleSubmit() {
    const result = step6Schema.safeParse({
      additional_details: formData.additional_details || undefined,
      confirmed_legitimate: formData.confirmed_legitimate,
      agreed_to_terms: formData.agreed_to_terms,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setServerError("");

    try {
      const payload = { ...formData, source: "web" };
      const res = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        success?: boolean;
        requestId?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        trackEvent("request_submission_failed", { reason: data.error ?? "unknown" });
        setServerError(
          data.error ?? "We couldn't submit your request. Please try again."
        );
        setSubmitting(false);
        return;
      }

      trackEvent("request_submitted", { request_id: data.requestId });
      clearForm();
      router.push(`/request/success?id=${data.requestId}`);
    } catch {
      trackEvent("request_submission_failed", { reason: "network_error" });
      setServerError("We couldn't submit your request. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          Anything else we should know?
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          Optional details that may help us.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="additional_details" className="sr-only">
          Additional details (optional)
        </label>
        <div className="relative">
          <textarea
            id="additional_details"
            value={formData.additional_details}
            onChange={(e) => {
              if (e.target.value.length <= MAX) {
                updateFormData({ additional_details: e.target.value });
              }
            }}
            placeholder="Any specific brands, models, quantities, specifications, delivery requirements, or other details we should know?"
            rows={5}
            maxLength={MAX}
            className="w-full border border-[#D8D8D8] rounded-xl bg-white text-[#050505] text-base px-4 py-3 resize-none transition-all focus:border-[#FFC400] focus:outline-none"
          />
          <span className="absolute bottom-3 right-4 text-xs text-[#9A9DA5]">
            {count}/{MAX}
          </span>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-3">
        <Checkbox
          id="confirmed_legitimate"
          checked={formData.confirmed_legitimate}
          error={errors.confirmed_legitimate}
          onChange={(v) => {
            updateFormData({ confirmed_legitimate: v });
            if (errors.confirmed_legitimate)
              setErrors((e) => ({ ...e, confirmed_legitimate: "" }));
          }}
          label="I confirm this is a legitimate request and I am authorized to make this purchase."
        />
        <Checkbox
          id="agreed_to_terms"
          checked={formData.agreed_to_terms}
          error={errors.agreed_to_terms}
          onChange={(v) => {
            updateFormData({ agreed_to_terms: v });
            if (errors.agreed_to_terms)
              setErrors((e) => ({ ...e, agreed_to_terms: "" }));
          }}
          label={
            <>
              I agree to the{" "}
              <a href="/terms" target="_blank" className="underline hover:text-[#050505]">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" className="underline hover:text-[#050505]">
                Privacy Policy
              </a>
              .
            </>
          }
        />
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
          {serverError}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
          aria-live="polite"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Request"
          )}
        </button>
        <button
          type="button"
          onClick={() => setStep(5)}
          disabled={submitting}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors mx-auto disabled:opacity-40"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}

interface CheckboxProps {
  id: string;
  checked: boolean;
  error?: string;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}

function Checkbox({ id, checked, error, onChange, label }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="sr-only peer"
          />
          <div className="w-5 h-5 border-2 border-[#D8D8D8] rounded peer-checked:bg-[#FFC400] peer-checked:border-[#FFC400] transition-all flex items-center justify-center">
            {checked && (
              <svg className="w-3 h-3 text-[#050505]" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-[#5E6168] leading-relaxed">{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500 ml-8">
          {error}
        </p>
      )}
    </div>
  );
}
