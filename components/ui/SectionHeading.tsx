import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/Reveal";

type Props = {
  title: ReactNode;
  text?: ReactNode;
  /** Действие справа — ссылка «весь каталог» и подобные. */
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
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
        {/* Риска прочерчивается вместе с появлением заголовка: `gauge`
            уже умеет это от общего наблюдателя, второго не заводим. */}
        <span aria-hidden="true" className="gauge accent-rule mb-6" />
        <h2 className="font-display text-h2 font-semibold text-balance">
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
