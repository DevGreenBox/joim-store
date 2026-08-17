import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StarMark } from "@/components/ui/StarMark";
import catalog from "@/content/pages/catalog.json";

/**
 * Витрина — не только плитки: заказчик просил усилить каталог УТП-блоками
 * и баннерами (структура 17.08, п. 4.1).
 *
 * Полоса доводов стоит над сеткой, баннер — под ней. Место выбрано
 * по поведению: сверху человек ещё выбирает, снизу он либо выбрал,
 * либо не решился — и там ему нужен разбор, а не ещё одна плитка.
 */

export function CatalogUsp() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
      {catalog.usp.map((item, index) => (
        <Reveal
          as="li"
          key={item.title}
          delay={index * 60}
          y={14}
          className="bg-surface p-5 lg:p-6"
        >
          <p className="num font-display text-[clamp(1.25rem,2.2vw,1.625rem)] leading-none font-semibold tracking-[-0.03em] text-accent">
            {item.value}
          </p>
          <h2 className="font-display mt-4 text-[15px] leading-snug font-semibold tracking-[-0.01em]">
            {item.title}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {item.text}
          </p>
        </Reveal>
      ))}
    </ul>
  );
}

export function CatalogBanner() {
  return (
    <Reveal className="relative isolate overflow-hidden rounded-2xl border border-line bg-surface p-6 lg:p-10">
      <StarMark className="pointer-events-none absolute -right-[8%] -bottom-[46%] -z-10 aspect-square w-[38%] rotate-[-14deg] text-accent/[0.07]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
      />

      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
        <div className="max-w-xl">
          <span aria-hidden="true" className="gauge accent-rule mb-5" />
          <h2 className="font-display text-[clamp(1.25rem,2.6vw,1.75rem)] leading-snug font-semibold tracking-[-0.02em]">
            {catalog.banner.title}
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            {catalog.banner.text}
          </p>
        </div>

        <ButtonLink href={catalog.banner.href} size="lg" arrow>
          {catalog.banner.cta}
        </ButtonLink>
      </div>
    </Reveal>
  );
}
