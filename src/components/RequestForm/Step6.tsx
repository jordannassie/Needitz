"use client";

import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFormContext } from "./FormContext";
import { step6Schema, parseReferenceLinks } from "@/lib/validation";
import { trackEvent } from "@/components/Analytics";
import { useRouter } from "next/navigation";

export function Step6() {
  const { formData, updateFormData, setStep, clearForm } = useFormContext();
  const [error, setError] = useState("");
  const [linksError, setLinksError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const MAX = 300;
  const LINKS_MAX = 2000;
  const count = formData.additional_details.length;
  const linksCount = formData.reference_links_raw.length;

  async function handleSubmit() {
    const result = step6Schema.safeParse({
      additional_details: formData.additional_details || undefined,
      reference_links_raw: formData.reference_links_raw || undefined,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Validation failed.");
      return;
    }
    setError("");

    // Client-side URL validation before submitting
    const { error: linkErr } = parseReferenceLinks(formData.reference_links_raw);
    if (linkErr) {
      setLinksError(linkErr);
      return;
    }
    setLinksError("");
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
                if (error) setError("");
              }
            }}
            placeholder="Any specific brands, models, quantities, specifications, delivery requirements, or other details we should know?"
            rows={5}
            maxLength={MAX}
            aria-describedby={error ? "details-error" : undefined}
            aria-invalid={!!error}
            className={`w-full border rounded-xl bg-white text-[#050505] text-base px-4 py-3 resize-none transition-all focus:border-[#FFC400] focus:outline-none ${
              error ? "border-red-400" : "border-[#D8D8D8]"
            }`}
          />
          <span className="absolute bottom-3 right-4 text-xs text-[#9A9DA5]">
            {count}/{MAX}
          </span>
        </div>
        {error && (
          <p id="details-error" role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* ── Reference links ─────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="reference_links"
          className="text-sm font-semibold text-[#050505]"
        >
          Reference links{" "}
          <span className="font-normal text-[#9A9DA5]">(optional)</span>
        </label>
        <p className="text-xs text-[#5E6168] mb-1.5 leading-relaxed">
          Add product pages, listings, image URLs, or other examples that may help us
          understand your request.
        </p>
        <div className="relative">
          <textarea
            id="reference_links"
            value={formData.reference_links_raw}
            onChange={(e) => {
              if (e.target.value.length <= LINKS_MAX) {
                updateFormData({ reference_links_raw: e.target.value });
                if (linksError) setLinksError("");
              }
            }}
            placeholder={"https://example.com/product\nhttps://example.com/reference-image"}
            rows={4}
            maxLength={LINKS_MAX}
            aria-describedby={linksError ? "links-error" : "links-hint"}
            aria-invalid={!!linksError}
            className={`w-full border rounded-xl bg-white text-[#050505] text-sm px-4 py-3 resize-none transition-all focus:border-[#FFC400] focus:outline-none font-mono leading-relaxed ${
              linksError ? "border-red-400" : "border-[#D8D8D8]"
            }`}
          />
          <span className="absolute bottom-3 right-4 text-xs text-[#9A9DA5]">
            {linksCount}/{LINKS_MAX}
          </span>
        </div>
        <p id="links-hint" className="text-[11px] text-[#9A9DA5]">
          One link per line. Maximum 10 links.
        </p>
        {linksError && (
          <p id="links-error" role="alert" className="text-sm text-red-500">
            {linksError}
          </p>
        )}
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

        <p className="text-center text-xs text-[#9A9DA5] leading-relaxed px-2">
          By submitting, you confirm this is a legitimate request, that you are authorized to
          make this purchase, and that you agree to the{" "}
          <Link href="/terms" className="underline hover:text-[#5E6168] transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[#5E6168] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

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
