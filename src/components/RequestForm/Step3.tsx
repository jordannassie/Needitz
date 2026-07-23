"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step3Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

export function Step3() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [error, setError] = useState("");

  function handleContinue() {
    const result = step3Schema.safeParse({
      deadline: formData.deadline,
      deadline_is_flexible: formData.deadline_is_flexible,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    trackEvent("request_step_completed", { step: 3 });
    setStep(4);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          When do you need it?
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          Let us know your target date.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="deadline" className="sr-only">
          Target deadline
        </label>
        <div className="relative">
          <Calendar
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9DA5] pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="deadline"
            type="date"
            value={formData.deadline}
            min={today}
            disabled={formData.deadline_is_flexible}
            onChange={(e) => {
              updateFormData({ deadline: e.target.value });
              if (error) setError("");
            }}
            aria-describedby={error ? "deadline-error" : undefined}
            aria-invalid={!!error}
            className={`input-field pl-9 disabled:opacity-40 disabled:bg-[#F7F7F7] ${
              error ? "error" : ""
            }`}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.deadline_is_flexible}
              onChange={(e) => {
                updateFormData({
                  deadline_is_flexible: e.target.checked,
                  deadline: e.target.checked ? "" : formData.deadline,
                });
                if (error) setError("");
              }}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-[#D8D8D8] rounded peer-checked:bg-[#FFC400] peer-checked:border-[#FFC400] transition-all flex items-center justify-center">
              {formData.deadline_is_flexible && (
                <svg className="w-3 h-3 text-[#050505]" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-base text-[#050505] font-medium">Flexible — no specific deadline</span>
        </label>

        {error && (
          <p id="deadline-error" role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={handleContinue} className="btn-primary">
          Continue
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors mx-auto"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}
