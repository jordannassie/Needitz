"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, User, Mail, Phone, Building2 } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step5Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

export function Step5() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleContinue() {
    const result = step5Schema.safeParse({
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.company_name || undefined,
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
    trackEvent("request_step_completed", { step: 5 });
    setStep(6);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          Your contact information
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          We'll use this to follow up about your request.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Field
          id="full_name"
          label="Full Name"
          icon={<User size={16} className="text-[#9A9DA5]" />}
          type="text"
          placeholder="Full Name"
          value={formData.full_name}
          autoComplete="name"
          error={errors.full_name}
          onChange={(v) => {
            updateFormData({ full_name: v });
            if (errors.full_name) setErrors((e) => ({ ...e, full_name: "" }));
          }}
        />
        <Field
          id="email"
          label="Email Address"
          icon={<Mail size={16} className="text-[#9A9DA5]" />}
          type="email"
          placeholder="Email Address"
          value={formData.email}
          autoComplete="email"
          error={errors.email}
          onChange={(v) => {
            updateFormData({ email: v });
            if (errors.email) setErrors((e) => ({ ...e, email: "" }));
          }}
        />
        <Field
          id="phone"
          label="Phone Number"
          icon={<Phone size={16} className="text-[#9A9DA5]" />}
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          autoComplete="tel"
          error={errors.phone}
          onChange={(v) => {
            updateFormData({ phone: v });
            if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
          }}
        />
        <Field
          id="company_name"
          label="Company Name (optional)"
          icon={<Building2 size={16} className="text-[#9A9DA5]" />}
          type="text"
          placeholder="Company Name (optional)"
          value={formData.company_name}
          autoComplete="organization"
          onChange={(v) => updateFormData({ company_name: v })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button type="button" onClick={handleContinue} className="btn-primary">
          Continue
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => setStep(4)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors mx-auto"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  autoComplete?: string;
  error?: string;
  onChange: (v: string) => void;
}

function Field({ id, label, icon, type, placeholder, value, autoComplete, error, onChange }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`input-field pl-9 ${error ? "error" : ""}`}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
