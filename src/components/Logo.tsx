interface LogoProps {
  /** Text size Tailwind class, e.g. "text-xl" or "text-2xl". Defaults to "text-xl". */
  size?: string;
}

/**
 * NeedItz wordmark.
 * "Need" is rendered in primary black (#050505).
 * "Itz" is rendered in NeedItz yellow (#FFC400).
 * A short yellow underline sits beneath the wordmark.
 */
export function Logo({ size = "text-xl" }: LogoProps) {
  return (
    <span className="flex flex-col items-start gap-0">
      <span className={`${size} font-black leading-none tracking-tight`}>
        <span className="text-[#050505]">Need</span>
        <span className="text-[#FFC400]">itz</span>
      </span>
      <span className="block h-[3px] w-10 bg-[#FFC400] rounded-full mt-[3px]" />
    </span>
  );
}
