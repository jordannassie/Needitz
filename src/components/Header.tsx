"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/request", label: "Submit a Request" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b-0">
        <div className="mx-auto max-w-2xl px-5 flex items-center justify-between h-16 sm:h-[72px]">
          <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] rounded-sm" aria-label="Needitz home">
            <Logo size="text-[26px] sm:text-[30px]" />
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 -mr-2 text-[#050505] hover:text-[#FFC400] transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
        {/* Yellow rule */}
        <div className="h-[3px] w-full bg-[#FFC400]" />
      </header>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <nav
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[#D8D8D8]">
          <span className="text-lg font-black text-[#050505]">Menu</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="p-2 -mr-2 text-[#050505] hover:text-[#FFC400] transition-colors"
          >
            <X size={22} />
          </button>
        </div>
        <ul className="py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-6 py-3.5 text-base font-semibold text-[#050505] hover:bg-[#F7F7F7] hover:text-[#FFC400] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
