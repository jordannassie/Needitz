import { Clock, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { PeopleSection } from "./PeopleSection";

// ─── Credibility items ────────────────────────────────────────────
const CREDIBILITY = [
  {
    icon: <span aria-hidden="true" className="text-xl leading-none">🇺🇸</span>,
    title: "USA Based",
    body: "Requests reviewed by our U.S. team.",
  },
  {
    icon: <Clock size={18} className="text-[#5E6168]" aria-hidden="true" />,
    title: "Response Within 72 Hours",
    body: "We'll let you know whether we believe we can help.",
  },
  {
    icon: <ShieldCheck size={18} className="text-[#5E6168]" aria-hidden="true" />,
    title: "Free to Submit",
    body: "No obligation to move forward.",
  },
  {
    icon: <UserCheck size={18} className="text-[#5E6168]" aria-hidden="true" />,
    title: "Human Reviewed",
    body: "Every legitimate request is reviewed individually.",
  },
];

export function HomeContent() {
  return (
    <div className="w-full">
      {/* ── Credibility ────────────────────────────────────────── */}
      <section
        aria-label="Why Needitx"
        className="w-full max-w-lg mx-auto px-5 pt-8 pb-2"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CREDIBILITY.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 bg-[#F7F7F7] border border-[#D8D8D8] rounded-xl px-3 py-4"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-[#D8D8D8]">
                {item.icon}
              </div>
              <p className="text-xs font-bold text-[#050505] leading-snug">{item.title}</p>
              <p className="text-xs text-[#5E6168] leading-snug">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What happens next ──────────────────────────────────── */}
      <section
        aria-label="What happens next"
        className="w-full max-w-lg mx-auto px-5 pt-8 pb-2"
      >
        <h2 className="text-base font-black text-[#050505] mb-4">What happens next?</h2>
        <ol className="flex flex-col gap-3" aria-label="Steps after submitting">
          {[
            "Submit what you need.",
            "We review the request.",
            "We contact you within 72 hours if we believe we can help.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFC400] text-[#050505] text-xs font-black flex items-center justify-center"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="text-sm text-[#050505] leading-relaxed pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex items-start gap-2 mt-5 bg-[#F7F7F7] border border-[#D8D8D8] rounded-xl px-4 py-3">
          <CheckCircle2 size={15} className="text-[#9A9DA5] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-[#5E6168] leading-relaxed">
            Submitting a request does not guarantee availability, pricing, or fulfillment.
          </p>
        </div>
      </section>

      {/* ── People section ─────────────────────────────────────── */}
      <PeopleSection />
    </div>
  );
}
