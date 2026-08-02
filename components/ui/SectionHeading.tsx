import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  /** Действие справа — ссылка «весь каталог» и подобные. */
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col gap-8 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <Reveal className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
          {title}
        </h2>
        {text ? (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            {text}
          </p>
        ) : null}
      </Reveal>
      {action ? (
        <Reveal delay={120} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
