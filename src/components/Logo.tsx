interface LogoProps {
  /** Text size Tailwind class, e.g. "text-xl" or "text-2xl". Defaults to "text-xl". */
  size?: string;
}

/**
 * Needitz wordmark.
 * "Need" black · "It" yellow · "z" black.
 * Accessible text reads as one word: NeedItz.
 */
export function Logo({ size = "text-xl" }: LogoProps) {
  return (
    <span className="flex flex-col items-start gap-0" aria-label="Needitz">
      <span
        className={`${size} font-black leading-none tracking-tight`}
        aria-hidden="true"
      >
        <span className="text-[#050505]">Need</span>
        <span className="text-[#FFC400]">it</span>
        <span className="text-[#050505]">z</span>
      </span>
      {/* Yellow underline — ~55% width scales proportionally with font size */}
      <span className="block h-[3px] w-[55%] bg-[#FFC400] rounded-full mt-[3px]" />
    </span>
  );
}
