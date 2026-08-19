import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import home from "@/content/pages/home.json";

/**
 * Три УТП сразу под первым экраном — формулировки заказчика из документа
 * «Структура и правки».
 *
 * Ячейки в общей рамке, а не тремя отдельными карточками: три плашки
 * с собственными краями и тенями на тёмной странице читаются как набор
 * кнопок. Одна рамка со швами в пиксель — это одна вещь, разделённая
 * на три, и именно так подаёт характеристики премиальная техника.
 *
 * Шов рисуется фоном сетки: `gap-px` открывает подложку `bg-line`
 * между ячейками, а внешний радиус срезает углы всей плашке целиком.
 * Границы у каждой ячейки дали бы двойную линию на стыке.
 */
export function HeroUsp() {
  return (
    <section className="py-16 lg:py-[75px]">
      <Container size="wide">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {home.heroUsp.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 70}
              className="relative bg-surface p-7 lg:p-9"
            >
              <span className="num text-[11px] font-medium tracking-[0.18em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display mt-4 text-lg leading-snug font-semibold tracking-[-0.01em]">
                {item.title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
