import Link from "next/link";
import { Logo } from "./Logo";

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
          {/* Social links */}
          <div className="flex items-center gap-3 mt-1">
            <a
              href="https://www.facebook.com/profile.php?id=61592072114259"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Needitz on Facebook"
              className="text-[#5E6168] hover:text-[#FFC400] transition-colors"
            >
              <FacebookIcon size={20} />
            </a>
            <a
              href="https://www.instagram.com/needitzcom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Needitz on Instagram"
              className="text-[#5E6168] hover:text-[#FFC400] transition-colors"
            >
              <InstagramIcon size={20} />
            </a>
          </div>
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
            © {year} Needitz. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
