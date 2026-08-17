import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { StarMark } from "@/components/ui/StarMark";
import home from "@/content/pages/home.json";

/**
 * «Идеальный подарок» — развилка на две страницы: частному лицу
 * и компании. Две кнопки, а не одна: сценарии расходятся с первого шага,
 * и общая страница «подарки» заставила бы выбирать дважды.
 *
 * Кадр — оба прибора и кейс на сиденье: подарок показан там, где им
 * пользуются, а не на белой подложке.
 */
export function GiftBand() {
  const { gift } = home.sections;

  return (
    <section className="py-16 lg:py-[75px]">
      <Container size="wide">
        {/* Колонка под кадр узкая, а блок высокий: снимок вертикальный
            (0,67), и в широкой ячейке обрезка по краю срезала приборы
            сверху и кейс справа. При отношении около 0,85 в кадр входит
            вся группа — оба прибора и кейс. */}
        <Reveal className="relative isolate grid overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[1fr_0.5fr]">
          <StarMark className="pointer-events-none absolute -top-[22%] -left-[8%] -z-10 aspect-square w-[46%] rotate-[-14deg] text-accent/[0.06]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
          />

          <div className="flex flex-col justify-center p-8 lg:p-14">
            <span aria-hidden="true" className="gauge accent-rule mb-6" />
            <h2 className="font-display text-h2 font-semibold text-balance">
              {gift.title}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              {gift.text}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={gift.personal.href} arrow>
                {gift.personal.label}
              </ButtonLink>
              <ButtonLink href={gift.business.href} variant="outline" arrow>
                {gift.business.label}
              </ButtonLink>
            </div>
          </div>

          {/* Кадр во всю ячейку, без полей: это не пакшот на подложке,
              а сцена — оба прибора и кейс лежат на сиденье. */}
          <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[470px]">
            <Image
              src="/images/products/es29-seat.webp"
              alt="Два пусковых устройства JOIM Easy Start и кейс на пассажирском сиденье"
              fill
              sizes="(max-width: 1023px) 100vw, 44vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
