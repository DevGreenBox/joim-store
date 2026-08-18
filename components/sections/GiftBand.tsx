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
 * Кадр — кейс в руках у открытого капота: подарок показан в момент,
 * ради которого его дарят, а не на белой подложке.
 */
export function GiftBand() {
  const { gift } = home.sections;

  return (
    <section className="py-16 lg:py-[75px]">
      <Container size="wide">
        {/* Ячейка подогнана под сам кадр: он горизонтальный, 1,50.
            Колонка 640×420 даёт 1,52 — обрезка съедает два процента
            высоты, и кейс с руками входит целиком. */}
        <Reveal className="relative isolate grid overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[1.1fr_1fr]">
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
              а сцена — кейс передают из рук в руки у открытого капота. */}
          <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[420px]">
            <Image
              src="/images/products/es19-gift.webp"
              alt="Жёсткий кейс JOIM Easy Start в руках у открытого капота"
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
