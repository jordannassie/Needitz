import Link from "next/link";
import { ClipboardList, Search, Handshake, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";

export const metadata = {
  title: "How It Works — Needitz",
};

const STEPS = [
  {
    icon: ClipboardList,
    title: "You Tell Us",
    description:
      "Submit exactly what you need, your budget, deadline, and location. It only takes a few minutes.",
  },
  {
    icon: Search,
    title: "We Review",
    description:
      "Our team and technology review the request and determine whether we can help source it.",
  },
  {
    icon: Handshake,
    title: "We Source and Negotiate",
    description:
      "For approved opportunities, we identify possible suppliers and work to negotiate pricing and terms.",
  },
  {
    icon: CheckCircle,
    title: "You Decide",
    description:
      "Review the proposed option and move forward only when you are ready. No commitment until you agree.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="px-5 py-12">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-10">
          <div>
            <h1 className="text-[32px] sm:text-[36px] font-black text-[#050505] leading-tight mb-3">
              How It Works
            </h1>
            <p className="text-[#5E6168] text-base leading-relaxed">
              Needitz is a simple, request-based sourcing service. Here's what happens after you submit.
            </p>
          </div>

          <ol className="flex flex-col gap-6" aria-label="How Needitz works">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-[#F7F7F7] flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <Icon size={22} className="text-[#050505]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">
                      Step {idx + 1}
                    </p>
                    <h2 className="text-lg font-black text-[#050505] mb-1">{step.title}</h2>
                    <p className="text-[#5E6168] text-sm leading-relaxed">{step.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="bg-[#F7F7F7] rounded-2xl px-6 py-5">
            <p className="text-sm text-[#5E6168] leading-relaxed mb-4">
              Submitting a request is free and does not guarantee availability, pricing, or fulfillment. Any opportunity will be subject to verification and a separate written agreement.
            </p>
          </div>

          <Link
            href="/request"
            className="btn-primary flex items-center justify-center gap-2 no-underline"
          >
            Submit a Request
          </Link>
        </div>
      </main>
    </>
  );
}
