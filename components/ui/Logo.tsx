import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JOIM STORE — на главную"
      className={`group/logo inline-flex items-center gap-2.5 ${className}`}
    >
      <svg
        viewBox="0 0 28 28"
        aria-hidden="true"
        className="size-7 shrink-0 text-ink"
      >
        <rect
          x="1"
          y="1"
          width="26"
          height="26"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.28"
        />
        <path
          d="M9 8h10M17 8v9.5A4.5 4.5 0 0 1 12.5 22H12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="10.2"
          cy="18.6"
          r="1.8"
          fill="var(--color-accent)"
          className="origin-center transition-transform duration-500 ease-out-expo group-hover/logo:scale-125"
        />
      </svg>
      <span className="font-display text-[15px] leading-none font-bold tracking-[0.2em] text-ink">
        JOIM
        <span className="ml-1.5 font-medium text-faint transition-colors duration-300 group-hover/logo:text-muted">
          STORE
        </span>
      </span>
    </Link>
  );
}
