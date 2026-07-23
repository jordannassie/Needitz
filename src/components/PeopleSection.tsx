import Image from "next/image";
import { FileText, User, Search, CheckCircle2 } from "lucide-react";

const PEOPLE = [
  {
    src: "/images/people/person-1.jpg",
    alt: "Professional representing a business owner",
  },
  {
    src: "/images/people/person-2.jpg",
    alt: "Professional representing a procurement manager",
  },
  {
    src: "/images/people/person-3.jpg",
    alt: "Professional representing a hospitality or operations manager",
  },
  {
    src: "/images/people/person-4.jpg",
    alt: "Professional representing a construction or logistics professional",
  },
];

const BUILT_FOR = [
  "Business owners",
  "Procurement teams",
  "Hotel and restaurant operators",
  "Construction companies",
  "Manufacturers",
  "Event producers",
  "Logistics teams",
  "Commercial property operators",
];

const BENEFITS = [
  {
    icon: <FileText size={16} className="text-[#050505]" aria-hidden="true" />,
    title: "One Simple Request",
    body: "Submit what you need, your budget, deadline, and location.",
  },
  {
    icon: <User size={16} className="text-[#050505]" aria-hidden="true" />,
    title: "Human Reviewed",
    body: "Every legitimate request is reviewed individually.",
  },
  {
    icon: <Search size={16} className="text-[#050505]" aria-hidden="true" />,
    title: "Current Supplier Research",
    body: "We research manufacturers, distributors, dealers, and sourcing options.",
  },
  {
    icon: <CheckCircle2 size={16} className="text-[#050505]" aria-hidden="true" />,
    title: "No Obligation",
    body: "Review the opportunity and decide whether you want to move forward.",
  },
];

export function PeopleSection() {
  return (
    <section
      aria-label="Who Needitx is built for"
      className="w-full border-t border-[#D8D8D8] bg-white"
    >
      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {/* LEFT — people + copy */}
          <div>
            <h2 className="text-lg font-black text-[#050505] leading-snug mb-2">
              Built for people who need answers
            </h2>
            <p className="text-sm text-[#5E6168] leading-relaxed mb-6">
              Needitx helps business owners, procurement teams, operators, and growing
              companies simplify large, urgent, and hard-to-source purchase requests.
            </p>

            {/* Overlapping circular portraits */}
            <div className="flex items-center mb-6" aria-label="Types of people Needitx serves">
              <div className="flex -space-x-3">
                {PEOPLE.map((p, i) => (
                  <div
                    key={i}
                    className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white flex-shrink-0"
                    style={{ zIndex: PEOPLE.length - i }}
                  >
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      className="object-cover"
                      sizes="48px"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Built for list */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-3">
                Built for
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {BUILT_FOR.map((role) => (
                  <li key={role} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#FFC400] flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs text-[#050505] leading-snug">{role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT — benefits */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9DA5] mb-4">
              How it works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-3 border border-[#D8D8D8] rounded-xl px-4 py-4 bg-[#F7F7F7]"
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#050505] mb-0.5">{b.title}</p>
                    <p className="text-xs text-[#5E6168] leading-snug">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
