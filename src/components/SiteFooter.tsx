import Link from "next/link";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Submit a Request" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#F7F7F7] border-t-[3px] border-[#FFC400]">
      {/* Main footer grid */}
      <div className="max-w-4xl mx-auto px-5 py-10 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Left — Brand */}
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="text-base font-bold text-[#050505]">Need something? Tell us.</p>
          <p className="text-sm text-[#5E6168] leading-relaxed max-w-xs">
            Submit large, urgent, unusual, or hard-to-source purchase requests. We'll review your
            request and contact you if we believe we can help.
          </p>
        </div>

        {/* Middle — Navigation */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-4">
            Navigate
          </p>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-[#050505] hover:text-[#FFC400] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right — Info */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-4">
            About
          </p>
          <p className="text-sm font-bold text-[#050505] mb-1">
            <span aria-label="USA flag" role="img">🇺🇸</span>{" "}USA Based
          </p>
          <p className="text-sm text-[#5E6168] leading-relaxed">
            We aim to review requests within 72 hours.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#D8D8D8]">
        <div className="max-w-4xl mx-auto px-5 py-4">
          <p className="text-xs text-[#9A9DA5] text-center sm:text-left">
            © {year} NeedItz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
