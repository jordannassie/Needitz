"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step1Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

export function Step1() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [error, setError] = useState("");

  const MAX = 500;
  const count = formData.item_request.length;

  function handleContinue() {
    const result = step1Schema.safeParse({ item_request: formData.item_request });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    trackEvent("request_step_completed", { step: 1 });
    setStep(2);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          What are you looking for?
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          Tell us exactly what you need and we'll review whether we can help source it.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="item_request" className="sr-only">
          Describe what you need
        </label>
        <div className="relative">
          <textarea
            id="item_request"
            value={formData.item_request}
            onChange={(e) => {
              if (e.target.value.length <= MAX) {
                updateFormData({ item_request: e.target.value });
                if (error) setError("");
              }
            }}
            placeholder="Example: I need 25 commercial refrigerators delivered to Dallas within 30 days."
            maxLength={MAX}
            rows={6}
            aria-describedby={error ? "item-error" : "item-hint"}
            aria-invalid={!!error}
            className={`w-full border rounded-xl bg-white text-[#050505] text-base px-4 py-3 resize-none transition-all focus:border-[#FFC400] focus:outline-none ${
              error ? "border-red-400" : "border-[#D8D8D8]"
            }`}
          />
          <span className="absolute bottom-3 right-4 text-xs text-[#9A9DA5]" aria-live="polite">
            {count}/{MAX}
          </span>
        </div>
        {error ? (
          <p id="item-error" role="alert" className="text-sm text-red-500 mt-1">
            {error}
          </p>
        ) : (
          <span id="item-hint" className="sr-only">
            Minimum 10 characters, maximum 500.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary"
          aria-label="Continue to budget step"
        >
          Continue
          <ArrowRight size={18} />
        </button>
        <p className="text-center text-sm text-[#9A9DA5]">It only takes a few seconds.</p>
      </div>

      <div className="flex items-start gap-2 bg-[#F7F7F7] rounded-xl px-4 py-3 mt-2">
        <ShieldCheck size={16} className="text-[#9A9DA5] mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm text-[#5E6168] leading-relaxed">
          <strong className="text-[#050505]">Free to submit.</strong> We'll review your request and contact you if we can help.
        </p>
      </div>
    </div>
  );
}
