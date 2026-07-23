"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, DollarSign } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step2Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

export function Step2() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [error, setError] = useState("");

  function handleContinue() {
    const result = step2Schema.safeParse({ budget: formData.budget });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    trackEvent("request_step_completed", { step: 2 });
    setStep(3);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          What is your budget?
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          This helps us find the right options.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="budget" className="sr-only">
          Budget
        </label>
        <div className="relative">
          <DollarSign
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9DA5]"
            aria-hidden="true"
          />
          <input
            id="budget"
            type="text"
            value={formData.budget}
            onChange={(e) => {
              updateFormData({ budget: e.target.value });
              if (error) setError("");
            }}
            placeholder="Enter your budget"
            aria-describedby={error ? "budget-error" : "budget-hint"}
            aria-invalid={!!error}
            className={`input-field pl-9 ${error ? "error" : ""}`}
          />
        </div>
        {error ? (
          <p id="budget-error" role="alert" className="text-sm text-red-500 mt-1">
            {error}
          </p>
        ) : (
          <p id="budget-hint" className="text-sm text-[#9A9DA5] mt-1">
            You can enter an exact amount or range — e.g. $250,000 or $200,000–$300,000. Type "Not sure" if unknown.
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
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors mx-auto"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}
