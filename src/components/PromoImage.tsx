import Image from "next/image";
import Link from "next/link";

const IMAGE_URL =
  "https://gecvmizbryyiefclfnhs.supabase.co/storage/v1/object/public/STORAGE/images/Adweb.png";

/**
 * Full-width promotional image section.
 * Placed directly above the footer on the homepage.
 * Clicking the image navigates to /request.
 */
export function PromoImage() {
  return (
    <section
      aria-label="NeedItz promotional image"
      className="w-full bg-white py-10 sm:py-14 px-4 sm:px-6"
    >
      <div className="max-w-[1400px] mx-auto">
        <Link
          href="/request"
          aria-label="Submit a request — learn more about NeedItz"
          className="block cursor-pointer rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC400] motion-safe:transition-opacity hover:opacity-95"
        >
          {/* Gray placeholder shown while the image loads */}
          <div className="bg-[#F7F7F7] rounded-2xl">
            <Image
              src={IMAGE_URL}
              alt="NeedItz promotional advertisement showing how users can submit large and hard-to-source purchase requests."
              width={1400}
              height={600}
              className="w-full h-auto rounded-2xl"
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), 1400px"
              quality={90}
              priority={false}
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
