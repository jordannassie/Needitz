/**
 * Testimonial component — not currently rendered anywhere.
 *
 * Enable this component only after verified customer testimonials are available.
 *
 * Requirements before enabling:
 * - Real customer name and company (with permission)
 * - Verified transaction or confirmed use of service
 * - Written consent from the customer
 * - No fabricated quotes, star ratings, or unverified claims
 */

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  company?: string;
}

export function Testimonial({ quote, name, role, company }: TestimonialProps) {
  return (
    <blockquote className="border border-[#D8D8D8] rounded-xl px-5 py-5 bg-white">
      <p className="text-sm text-[#050505] leading-relaxed mb-4 italic">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="flex items-center gap-3">
        <div>
          <p className="text-xs font-bold text-[#050505]">{name}</p>
          <p className="text-xs text-[#5E6168]">
            {role}{company ? `, ${company}` : ""}
          </p>
        </div>
      </footer>
    </blockquote>
  );
}
