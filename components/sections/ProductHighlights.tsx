import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import type { Highlight } from "@/lib/types";

/**
 * Приборная панель модели: четыре показания, ради которых её берут.
 *
 * Стоит сразу под ценой и кнопкой — до характеристик и до описания.
 * Покупатель, который пришёл за одним числом, находит его, не читая
 * ничего; остальным панель задаёт масштаб для всего, что ниже.
 *
 * Число отсчитывается, над ним доезжает шкала — обе анимации живут
 * на одном `is-revealed` от Reveal, отдельных наблюдателей нет.
 */

/** «40+» → «40» и «+». Хвост CountUp не считает, он дописывается рядом. */
function split(value: string): { count: string; tail: string } {
  const match = value.match(/^([\d\s.,]+)(.*)$/);
  if (!match) return { count: "", tail: value };
  return { count: match[1].trim(), tail: match[2] };
}

export function ProductHighlights({
  items,
  /** 2 — в узкой колонке карточки, 4 — во всю ширину страницы категории. */
  columns = 2,
}: {
  items: Highlight[];
  columns?: 2 | 4;
}) {
  if (items.length === 0) return null;

  return (
    <dl
      className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line ${
        columns === 4 ? "lg:grid-cols-4" : ""
      }`}
    >
      {items.map((item, index) => {
        const { count, tail } = split(item.value);

        return (
          <Reveal
            key={item.label}
            delay={index * 90}
            y={16}
            className="bg-surface p-5 lg:p-7"
          >
            <span
              aria-hidden="true"
              className="gauge mb-5 block h-px w-full bg-accent/60"
            />
            <dt className="num font-display text-[clamp(1.5rem,3.2vw,2.25rem)] leading-none font-semibold tracking-[-0.035em]">
              {count ? <CountUp value={count} /> : null}
              {tail}
              {item.unit ? (
                <span className="readout ml-1.5 align-baseline text-[13px] font-normal text-faint">
                  {item.unit}
                </span>
              ) : null}
            </dt>
            <dd className="mt-3 text-[13px] leading-snug text-muted">
              {item.label}
            </dd>
          </Reveal>
        );
      })}
    </dl>
  );
}
