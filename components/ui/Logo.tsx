import Link from "next/link";

import { StarMark } from "@/components/ui/StarMark";

/**
 * Знак плюс слово, как в материалах бренда: звезда зелёная, «JOIM»
 * основным, «STORE» тише. Прежняя «J» в рамке была выдумкой — у бренда
 * есть свой знак, и он на каждом устройстве.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="JOIM STORE — на главную"
      className={`group/logo inline-flex min-h-11 items-center gap-2.5 lg:min-h-0 ${className}`}
    >
      <StarMark className="size-7 shrink-0 text-accent transition-transform duration-500 ease-out-expo group-hover/logo:rotate-90" />
      <span className="font-display text-[15px] leading-none font-bold tracking-[0.2em] text-ink">
        JOIM
        <span className="ml-1.5 font-medium text-faint transition-colors duration-300 group-hover/logo:text-muted">
          STORE
        </span>
      </span>
    </Link>
  );
}
