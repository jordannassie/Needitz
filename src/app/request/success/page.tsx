import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { Header } from "@/components/Header";

export const metadata = {
  title: "Request Received — Needitx",
};

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { id } = await searchParams;

  return (
    <>
      <Header />
      <main
        id="main-content"
        className="min-h-[calc(100vh-60px)] flex items-start justify-center px-5 py-12"
      >
        <div className="w-full max-w-lg flex flex-col items-center text-center gap-6">
          {/* Yellow checkmark */}
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
              Thanks! We&apos;re reviewing your request and will contact you if we believe we can help.
            </p>
          </div>

          {id && (
            <div className="w-full bg-[#F7F7F7] rounded-2xl px-6 py-5 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9A9DA5] mb-1">
                Request ID
              </p>
              <p className="text-2xl font-black text-[#050505] tracking-tight">{id}</p>
            </div>
          )}

          <div className="flex flex-col w-full gap-3 mt-2">
            <Link href="/request" className="btn-primary flex items-center justify-center gap-2 no-underline">
              Submit Another Request
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-[#5E6168] hover:text-[#050505] transition-colors">
              How It Works →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
