"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowDownRight,
  ShieldCheck,
  Lock,
  Lightbulb,
  Clock,
  Shield,
  User,
  Tag,
} from "lucide-react";
import { useFormContext } from "./FormContext";
import { step1Schema } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";

// ─── Typing examples ─────────────────────────────────────────────
const EXAMPLES = [
  "I need 25 commercial refrigerators delivered to Dallas within 30 days.",
  "I need 500 hotel beds for a property opening next month.",
  "I need 50 construction vehicles delivered to Texas.",
  "I need 100,000 custom product boxes by September.",
];
const TYPE_MS = 48;
const DELETE_MS = 28;
const PAUSE_FULL = 1900;
const PAUSE_EMPTY = 420;

// ─── Sparkle icon ─────────────────────────────────────────────────
function Sparkle({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 0L6.9 4.8L12 6L6.9 7.2L6 12L5.1 7.2L0 6L5.1 4.8L6 0Z"
        fill="#FFC400"
      />
    </svg>
  );
}

// ─── Trust benefits ───────────────────────────────────────────────
// Per-cell border classes: mobile 2×2 grid, desktop 1×4 row
const CELL_BORDERS = [
  "border-r border-b sm:border-b-0",          // 0: top-left
  "border-b sm:border-b-0 sm:border-r",       // 1: top-right (desktop: adds right border)
  "border-r",                                  // 2: bottom-left
  "",                                          // 3: bottom-right, no border
];

const TRUST_ITEMS = [
  {
    icon: <Clock size={20} strokeWidth={1.8} className="text-[#FFC400]" aria-hidden="true" />,
    title: "Fast Response",
    body: "Usually within 72 hours",
  },
  {
    icon: <Shield size={20} strokeWidth={1.8} className="text-[#FFC400]" aria-hidden="true" />,
    title: "Secure & Private",
    body: "Your information is protected",
  },
  {
    icon: <User size={20} strokeWidth={1.8} className="text-[#FFC400]" aria-hidden="true" />,
    title: "Human Reviewed",
    body: "Real people review every request",
  },
  {
    icon: <Tag size={20} strokeWidth={1.8} className="text-[#FFC400]" aria-hidden="true" />,
    title: "No Obligation",
    body: "You decide if you want to move forward",
  },
];

export function Step1() {
  const { formData, updateFormData, setStep } = useFormContext();
  const [error, setError] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [userActive, setUserActive] = useState(false);

  const MAX = 500;
  const count = formData.item_request.length;
  const hasValue = count > 0;

  // ── Typing animation ──────────────────────────────────────────
  useEffect(() => {
    if (userActive || hasValue) return;

    let exIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const sentence = EXAMPLES[exIdx % EXAMPLES.length];
      if (!deleting) {
        charIdx++;
        setDisplayText(sentence.slice(0, charIdx));
        if (charIdx >= sentence.length) {
          deleting = true;
          timer = setTimeout(tick, PAUSE_FULL);
        } else {
          timer = setTimeout(tick, TYPE_MS);
        }
      } else {
        charIdx = Math.max(0, charIdx - 1);
        setDisplayText(sentence.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          exIdx++;
          timer = setTimeout(tick, PAUSE_EMPTY);
        } else {
          timer = setTimeout(tick, DELETE_MS);
        }
      }
    };

    timer = setTimeout(tick, PAUSE_EMPTY);
    return () => clearTimeout(timer);
  }, [userActive, hasValue]);

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

  const showOverlay = !userActive && !hasValue && !isFocused && displayText.length > 0;
  const glowClass =
    !isFocused && !error && !hasValue && !userActive ? "textarea-idle-glow" : "";

  return (
    <div className="flex flex-col gap-5">

      {/* ── Heading ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-start gap-2 mb-2">
          {/* Decorative sparkles */}
          <span
            aria-hidden="true"
            className="flex flex-col gap-1.5 pt-2 flex-shrink-0"
          >
            <Sparkle size={9} />
            <Sparkle size={13} />
          </span>

          <h1 className="text-[28px] sm:text-[38px] font-black text-[#050505] leading-tight sm:whitespace-nowrap">
            What are{" "}
            <span className="relative inline-block">
              <span>you</span>
              {/* Clean yellow underline — straight line with rounded ends */}
              <svg
                aria-hidden="true"
                className="absolute left-0 w-full overflow-visible pointer-events-none"
                style={{ bottom: "-5px" }}
                height="4"
                viewBox="0 0 50 4"
                preserveAspectRatio="none"
              >
                <line
                  className="you-underline-path"
                  x1="1"
                  y1="2"
                  x2="49"
                  y2="2"
                  stroke="#FFC400"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            looking for?
          </h1>
        </div>
        <p className="text-[#5E6168] text-base sm:text-[17px] leading-relaxed">
          Tell us exactly what you need and we'll review whether we can help source it.
        </p>
      </div>

      {/* ── Textarea ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="item_request" className="sr-only">
          Describe what you are looking for
        </label>

        {/* Helper row */}
        <div className="flex items-center gap-1.5 mb-2" aria-hidden="true">
          <Lightbulb size={13} className="text-[#9A9DA5] flex-shrink-0" />
          <span className="text-xs text-[#9A9DA5]">Just type what you need</span>
          <ArrowDownRight size={16} className="text-[#8B9099] flex-shrink-0" strokeWidth={1.75} />
        </div>

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
            rows={7}
            placeholder=""
            aria-label="Describe what you are looking for"
            aria-describedby={error ? "item-error" : "item-hint"}
            aria-invalid={!!error}
            className={[
              "w-full border rounded-2xl bg-white text-[#050505] text-base px-4 py-3 resize-none transition-all focus:outline-none leading-relaxed",
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

          {/* Typing overlay */}
          {showOverlay && (
            <div
              aria-hidden="true"
              className="absolute inset-0 px-4 py-3 text-base text-[#9A9DA5] italic pointer-events-none select-none rounded-2xl overflow-hidden leading-relaxed"
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

      {/* ── Continue button ───────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleContinue}
          aria-label="Continue to budget step"
          className="btn-primary group"
        >
          <span>Continue</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1 flex items-center">
            <ArrowRight size={18} className="text-[#FFC400]" />
          </span>
        </button>

        {/* Green lock micro-trust */}
        <div className="flex items-center justify-center gap-1.5">
          <Lock size={13} className="text-[#16A34A]" aria-hidden="true" />
          <span className="text-sm text-[#5E6168]">It only takes a few seconds.</span>
        </div>
      </div>

      {/* ── Free to submit trust card ─────────────────────────── */}
      <div className="flex items-start gap-2.5 bg-[#F4FBF6] border border-[#BBF7D0] rounded-xl px-4 py-3">
        <span className="flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center rounded-md bg-[#DCFCE7]">
          <ShieldCheck size={14} className="text-[#16A34A]" aria-hidden="true" />
        </span>
        <p className="text-sm text-[#5E6168] leading-relaxed">
          <strong className="text-[#16A34A]">Free to submit.</strong> We'll review your
          request and contact you if we can help.
        </p>
      </div>

      {/* ── Trust benefits row ────────────────────────────────── */}
      <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`flex flex-col items-center text-center px-3 py-4 bg-white border-[#E5E7EB] ${
                CELL_BORDERS[i]
              }`}
            >
              {item.icon}
              <p className="text-xs font-bold text-[#050505] mt-2 leading-snug">{item.title}</p>
              <p className="text-[11px] text-[#5E6168] mt-0.5 leading-snug">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tagline image ─────────────────────────────────────── */}
      <div className="flex justify-center">
        <Image
          src="https://gecvmizbryyiefclfnhs.supabase.co/storage/v1/object/public/STORAGE/images/Find%20it.png"
          alt="We find it. You get it."
          width={220}
          height={110}
          className="h-auto w-[160px] sm:w-[200px]"
          priority={false}
        />
      </div>

    </div>
  );
}
