"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step4Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

export function Step4() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [error, setError] = useState("");

  function handleContinue() {
    const result = step4Schema.safeParse({ delivery_location: formData.delivery_location });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    trackEvent("request_step_completed", { step: 4 });
    setStep(5);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          Where should it be delivered?
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          Enter the city and state or country.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="delivery_location" className="sr-only">
          Delivery location
        </label>
        <div className="relative">
          <MapPin
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9DA5]"
            aria-hidden="true"
          />
          <input
            id="delivery_location"
            type="text"
            value={formData.delivery_location}
            onChange={(e) => {
              updateFormData({ delivery_location: e.target.value });
              if (error) setError("");
            }}
            placeholder="City, State or Country"
            aria-describedby={error ? "location-error" : undefined}
            aria-invalid={!!error}
            className={`input-field pl-9 ${error ? "error" : ""}`}
          />
        </div>
        {error && (
          <p id="location-error" role="alert" className="text-sm text-red-500 mt-1">
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
          onClick={() => setStep(3)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors mx-auto"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}
