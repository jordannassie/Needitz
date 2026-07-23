import { Header } from "@/components/Header";
import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact — Needitz",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="px-5 py-12">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-8">
          <div>
            <h1 className="text-[32px] font-black text-[#050505] leading-tight mb-2">Contact</h1>
            <p className="text-[#5E6168] text-base leading-relaxed">
              Have a question or want to follow up on a request?
            </p>
          </div>

          <div className="bg-[#F7F7F7] rounded-2xl px-6 py-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-[#050505] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-[#050505]">Email us</p>
                <a
                  href="mailto:hello@needitz.com"
                  className="text-sm text-[#5E6168] hover:text-[#FFC400] transition-colors"
                >
                  hello@needitz.com
                </a>
              </div>
            </div>
            <p className="text-sm text-[#9A9DA5]">
              For existing requests, include your Request ID in the subject line.
            </p>
          </div>

          <Link href="/request" className="btn-primary flex items-center justify-center gap-2 no-underline">
            Submit a Request
          </Link>
        </div>
      </main>
    </>
  );
}
