import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { DragScroll } from "@/components/ui/DragScroll";
import { FrameBackdrop } from "@/components/ui/FrameBackdrop";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";

/**
 * Лента баннеров с ключевыми преимуществами.
 *
 * Листается жестом: пальцем и колесом — средствами браузера, мышью —
 * перетаскиванием с инерцией (`DragScroll`). Стрелок нет намеренно:
 * они требуют состояния, скрипта и всё равно проигрывают жесту.
 *
 * Прилипание ослаблено до `proximity`: при `mandatory` лента дёргается
 * к ближайшей карточке прямо посреди наката и инерция не читается.
 *
 * Баннеров шесть, видно два с половиной: обрезанный третий и есть
 * приглашение листать, а не подпись «листайте».
 *
 * `scroll-padding` повторяет поле контейнера: без него прилипание
 * сматывает поле в ноль, и первая карточка встаёт вплотную к краю
 * экрана, ломая колонку страницы.
 */
export function BenefitSlider() {
  return (
    <section className="overflow-hidden py-16 lg:py-[75px]">
      <Container size="wide">
        <SectionHeading
          title={home.sections.benefits.title}
          text={home.sections.benefits.text}
        />
      </Container>

      {/* Лента выходит за контейнер вправо: обрезанная карточка на краю
          показывает, что дальше есть ещё. Слева поле контейнера держится
          отступом первой карточки. */}
      <DragScroll
        aria-label={home.sections.benefits.title}
        className="mt-10 flex snap-x snap-proximity gap-5 overflow-x-auto scroll-pl-5 px-5 pb-4 sm:scroll-pl-8 sm:px-8 lg:mt-14 lg:gap-6 lg:scroll-pl-12 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {home.benefits.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={index * 60}
            className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[32vw] xl:w-[26rem]"
          >
            <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl border border-line">
              <FrameBackdrop />
              <Image
                src={item.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 639px) 78vw, (max-width: 1023px) 46vw, 26rem"
                className="object-contain p-[9%]"
              />

              <p className="num font-display absolute top-5 left-6 text-fig font-semibold">
                {item.value}
                {item.unit ? (
                  <span className="readout ml-1 text-[12px] font-normal text-faint">
                    {item.unit}
                  </span>
                ) : null}
              </p>
            </div>

            <h3 className="font-display mt-5 text-lg leading-snug font-semibold tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-muted">
              {item.text}
            </p>
          </Reveal>
        ))}
      </DragScroll>
    </section>
  );
}
