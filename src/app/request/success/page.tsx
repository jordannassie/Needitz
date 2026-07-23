import Link from "next/link";
import { CheckIcon, FlaskConical } from "lucide-react";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Request Received — NeedItz",
};

interface Props {
  searchParams: Promise<{ id?: string; preview?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { id, preview } = await searchParams;
  const isPreview = preview === "true";

  return (
    <>
      <Header />
      <main
        id="main-content"
        className="min-h-[calc(100vh-60px)] flex items-start justify-center px-5 py-12"
      >
        <div className="w-full max-w-lg flex flex-col items-center text-center gap-6">
          {/* Yellow checkmark circle */}
          <div
            className="w-20 h-20 rounded-full bg-[#FFC400] flex items-center justify-center"
            aria-hidden="true"
          >
            <CheckIcon size={40} strokeWidth={3} className="text-[#050505]" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] sm:text-[32px] font-black text-[#050505] leading-tight">
              Request received!
            </h1>
            <p className="text-[#5E6168] text-base leading-relaxed max-w-sm mx-auto">
              {isPreview
                ? "Your request flow is complete."
                : "Thanks! We're reviewing your request and will contact you if we believe we can help."}
            </p>
          </div>

          {/* Request ID card */}
          {id && (
            <div className="w-full bg-[#F7F7F7] rounded-2xl px-6 py-5 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">
                Request ID
              </p>
              <p className="text-2xl font-black text-[#050505] tracking-tight">{id}</p>
              <p className="text-sm text-[#5E6168] mt-2">
                {isPreview
                  ? "This is a preview ID — no data has been saved."
                  : "We've sent a confirmation email with the details."}
              </p>
            </div>
          )}

          {/* ─── PREVIEW NOTICE ──────────────────────────────────────────────────
              This block is shown only when the site is running without a database.
              TO REMOVE: connect Supabase, Resend, and environment variables.
              The ?preview=true param is set by the API when no DB is configured.
          ──────────────────────────────────────────────────────────────────── */}
          {isPreview && (
            <div className="w-full flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left">
              <FlaskConical
                size={18}
                className="text-amber-500 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-amber-800 mb-0.5">
                  Preview mode
                </p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  NeedItz is currently in preview mode, so this request has not been saved or emailed.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col w-full gap-3 mt-2">
            <Link
              href="/request"
              className="btn-primary flex items-center justify-center gap-2 no-underline"
            >
              Submit Another Request
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors"
            >
              How It Works →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
