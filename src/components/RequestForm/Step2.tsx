"use client";

import { useEffect } from "react";
import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useFormContext } from "./FormContext";
import { trackEvent } from "@/components/Analytics";

// ─── Preset values ────────────────────────────────────────────────
const PRESETS = [
  "$10", "$100", "$500", "$1,000", "$2,500", "$5,000",
  "$10,000", "$25,000", "$50,000", "$100,000", "$250,000",
  "$500,000", "$1M", "$2.5M", "$5M", "$10M+",
] as const;

const DEFAULT_IDX = 7; // $25,000

const QUICK_PICKS: { label: string; idx: number }[] = [
  { label: "$10K",  idx: 6  },
  { label: "$25K",  idx: 7  },
  { label: "$50K",  idx: 8  },
  { label: "$100K", idx: 9  },
  { label: "$250K", idx: 10 },
  { label: "$1M+",  idx: 12 },
];

type Mode = "preset" | "custom";

function matchPreset(budget: string): number | null {
  const idx = PRESETS.indexOf(budget as (typeof PRESETS)[number]);
  return idx >= 0 ? idx : null;
}

export function Step2() {
  const { formData, updateFormData, setStep } = useFormContext();

  // Restore previous mode + values from saved budget
  const savedIdx = matchPreset(formData.budget);
  const [mode, setMode] = useState<Mode>(
    formData.budget === "" || savedIdx !== null ? "preset" : "custom"
  );
  const [presetIdx, setPresetIdx] = useState(
    savedIdx !== null ? savedIdx : DEFAULT_IDX
  );
  const [customText, setCustomText] = useState(
    savedIdx === null && formData.budget !== "" ? formData.budget : ""
  );
  const [error, setError] = useState("");

  // On mount: ensure budget is initialized to the preset label
  useEffect(() => {
    if (mode === "preset") {
      updateFormData({ budget: PRESETS[presetIdx] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectPreset(idx: number) {
    setPresetIdx(idx);
    updateFormData({ budget: PRESETS[idx] });
    if (error) setError("");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    if (next === "preset") {
      updateFormData({ budget: PRESETS[presetIdx] });
    } else {
      // Restore custom text if it exists, otherwise leave budget as-is until user types
      if (customText.trim()) updateFormData({ budget: customText.trim() });
    }
  }

  function handleContinue() {
    if (mode === "custom") {
      const trimmed = customText.trim();
      if (!trimmed) {
        setError('Please enter your budget or switch to "Select a budget."');
        return;
      }
      updateFormData({ budget: trimmed });
    }
    setError("");
    trackEvent("request_step_completed", { step: 2 });
    setStep(3);
  }

  const pct = (presetIdx / (PRESETS.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Heading ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight mb-2">
          What is your budget?
        </h1>
        <p className="text-[#5E6168] text-base leading-relaxed">
          This helps us find the right options.
        </p>
      </div>

      {/* ── Mode toggle ───────────────────────────────────────────── */}
      <div
        className="flex rounded-xl bg-[#F3F4F6] p-1 gap-1"
        role="group"
        aria-label="Budget entry method"
      >
        {(["preset", "custom"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] ${
              mode === m
                ? "bg-[#050505] text-white shadow-sm"
                : "text-[#5E6168] hover:text-[#050505]"
            }`}
          >
            {m === "preset" ? "Select a budget" : "Custom budget"}
          </button>
        ))}
      </div>

      {/* ── Preset mode ───────────────────────────────────────────── */}
      {mode === "preset" && (
        <div className="flex flex-col gap-5">

          {/* Current value */}
          <div className="text-center py-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-1.5">
              Estimated budget
            </p>
            <p
              className="text-[44px] font-black text-[#050505] leading-none"
              aria-live="polite"
              aria-atomic="true"
            >
              {PRESETS[presetIdx]}
            </p>
            <p className="text-xs text-[#9A9DA5] mt-2">
              Choose the closest estimate. You can add a custom amount below.
            </p>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min={0}
              max={PRESETS.length - 1}
              step={1}
              value={presetIdx}
              onChange={(e) => selectPreset(Number(e.target.value))}
              className="budget-slider w-full"
              style={{ "--budget-pct": `${pct}%` } as React.CSSProperties}
              aria-label="Budget slider"
              aria-valuemin={0}
              aria-valuemax={PRESETS.length - 1}
              aria-valuenow={presetIdx}
              aria-valuetext={PRESETS[presetIdx]}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-[#9A9DA5]">$10</span>
              <span className="text-xs text-[#9A9DA5]">$10M+</span>
            </div>
          </div>

          {/* Quick picks */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PICKS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => selectPreset(qp.idx)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] ${
                  presetIdx === qp.idx
                    ? "bg-[#FFF8CC] border-[#FFC400] text-[#050505]"
                    : "bg-white border-[#D8D8D8] text-[#5E6168] hover:border-[#FFC400] hover:text-[#050505]"
                }`}
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Custom mode ───────────────────────────────────────────── */}
      {mode === "custom" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="budget_custom" className="text-sm font-semibold text-[#050505]">
            Enter your budget
          </label>
          <input
            id="budget_custom"
            type="text"
            value={customText}
            onChange={(e) => {
              const val = e.target.value.slice(0, 100);
              setCustomText(val);
              updateFormData({ budget: val });
              if (error) setError("");
            }}
            placeholder='Example: $200,000–$300,000 or "Not sure"'
            maxLength={100}
            aria-describedby={error ? "budget-error" : "budget-custom-hint"}
            aria-invalid={!!error}
            className={`input-field ${error ? "error" : ""}`}
          />
          {!error && (
            <p id="budget-custom-hint" className="text-xs text-[#9A9DA5] mt-1">
              Enter an exact amount, range, or "Not sure."
            </p>
          )}
        </div>
      )}

      {error && (
        <p id="budget-error" role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleContinue}
          className="btn-primary group"
          aria-label="Continue to deadline step"
        >
          <span>Continue</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1 flex items-center">
            <ArrowRight size={18} className="text-[#FFC400]" />
          </span>
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
