"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useFormContext } from "./FormContext";
import { step1Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

// ─── Typing animation examples ───────────────────────────────────
const EXAMPLES = [
  "I need 25 commercial refrigerators delivered to Dallas within 30 days.",
  "I need 500 hotel beds for a new property opening next month.",
  "I need 50 construction vehicles delivered to Texas by Q4.",
  "I need 100,000 custom product boxes manufactured by September.",
];

const TYPE_MS = 48;    // ms per character typed
const DELETE_MS = 28;  // ms per character deleted
const PAUSE_FULL = 1900;  // pause at end of sentence
const PAUSE_EMPTY = 420;  // pause before next sentence

export function Step1() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [error, setError] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  // Once the user has interacted, never restart the typing animation
  const [userActive, setUserActive] = useState(false);

  const MAX = 500;
  const count = formData.item_request.length;
  const hasValue = count > 0;

  // ── Typing animation ────────────────────────────────────────────
  useEffect(() => {
    if (userActive || hasValue) return;

    let exIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const sentence = EXAMPLES[exIdx % EXAMPLES.length];

      if (!deleting) {
        charIdx++;
        setDisplayText(sentence.slice(0, charIdx));
        if (charIdx >= sentence.length) {
          deleting = true;
          timer = setTimeout(step, PAUSE_FULL);
        } else {
          timer = setTimeout(step, TYPE_MS);
        }
      } else {
        charIdx = Math.max(0, charIdx - 1);
        setDisplayText(sentence.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          exIdx++;
          timer = setTimeout(step, PAUSE_EMPTY);
        } else {
          timer = setTimeout(step, DELETE_MS);
        }
      }
    };

    timer = setTimeout(step, PAUSE_EMPTY);
    return () => clearTimeout(timer);
  }, [userActive, hasValue]);

  // Stop animation on focus or first keystroke
  function handleFocus() {
    setIsFocused(true);
    setUserActive(true);
    setDisplayText("");
  }

  function handleBlur() {
    setIsFocused(false);
  }

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

  // Show the overlay only when idle, not focused, no user value
  const showOverlay = !userActive && !hasValue && !isFocused && displayText.length > 0;

  // Glow class: idle = animated ring, focused = Tailwind focus style, error = none
  const glowClass =
    !isFocused && !error && !hasValue && !userActive ? "textarea-idle-glow" : "";

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
          Describe what you are looking for
        </label>

        {/* Subtle helper above the textarea */}
        <p className="text-xs text-[#9A9DA5] mb-1.5 select-none" aria-hidden="true">
          Just type what you need
        </p>

        <div className="relative">
          <textarea
            id="item_request"
            value={formData.item_request}
            onChange={(e) => {
              if (e.target.value.length <= MAX) {
                updateFormData({ item_request: e.target.value });
                if (!userActive) {
                  setUserActive(true);
                  setDisplayText("");
                }
                if (error) setError("");
              }
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={MAX}
            rows={6}
            placeholder=""
            aria-label="Describe what you are looking for"
            aria-describedby={error ? "item-error" : "item-hint"}
            aria-invalid={!!error}
            className={[
              "w-full border rounded-xl bg-white text-[#050505] text-base px-4 py-3 resize-none transition-all focus:outline-none",
              error
                ? "border-red-400"
                : isFocused
                ? "border-[#FFC400] shadow-[0_0_0_3px_rgba(255,196,0,0.15)]"
                : "border-[#D8D8D8]",
              glowClass,
            ]
              .filter(Boolean)
              .join(" ")}
          />

          {/* Animated typing overlay — decorative, hidden from a11y */}
          {showOverlay && (
            <div
              aria-hidden="true"
              className="absolute inset-0 px-4 py-3 text-base text-[#9A9DA5] pointer-events-none select-none rounded-xl overflow-hidden leading-relaxed"
            >
              <span>{displayText}</span>
              <span className="typing-cursor inline-block w-[1.5px] h-[1.1em] bg-[#FFC400] align-[-2px] ml-[1px]" />
            </div>
          )}

          {/* Character counter */}
          <span
            className="absolute bottom-3 right-4 text-xs text-[#9A9DA5]"
            aria-live="polite"
          >
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
          <strong className="text-[#050505]">Free to submit.</strong> We'll review your
          request and contact you if we can help.
        </p>
      </div>
    </div>
  );
}
