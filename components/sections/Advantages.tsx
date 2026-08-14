import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";

/**
 * Четыре довода о бренде — на кадре из репортажа заказчика.
 *
 * Раньше блок был сплошной серой плитой на цвет плашки: четыре ячейки
 * в рамке, разделённые волосяной линией. Смысл в нём был, вида не было.
 * Теперь под ним сцена, которую заголовок и называет, — человек у
 * открытого капота в тёмном боксе, — а ячейки стоят на ней стеклянными
 * плашками. Тот же приём, что у показаний в первом экране: кадр во всю
 * ширину и полупрозрачные плашки поверх.
 */
export function Advantages() {
  return (
    <section className="relative isolate overflow-hidden border-y border-line py-16 lg:py-[75px]">
      {/* Кадр и две завесы. Диагональная гасит левый верх, где стоит
          заголовок; нижняя доводит край до цвета страницы, чтобы блок
          не обрывался линией по границе секции. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
        <Image
          src="/images/hero/advantages.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[38%_44%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(150deg,rgba(17,19,19,0.95)_0%,rgba(17,19,19,0.84)_30%,rgba(17,19,19,0.52)_58%,rgba(17,19,19,0.64)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,var(--color-void),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 brand-lines mask-fade-y opacity-30"
      />

      <Container size="wide">
        <SectionHeading title={home.sections.advantages.title} />

        {/* У каждой ячейки свой номер крупным «показанием» и отклик: слева
            сверху вниз прочерчивается акцентная риска — тот же приём, что
            подчёркивание в меню. `active` продублирован специально:
            на телефоне hover не существует. */}
        <ul className="mt-10 grid gap-4 lg:mt-14 md:grid-cols-2 lg:gap-5">
          {home.advantages.map((item, index) => (
            <Reveal
              key={item.title}
              as="li"
              delay={index * 80}
              // Размытие подложки только на десктопе и не `xl`: плашка стоит
              // на 82% непрозрачности, и сильнее размывать нечего, а четыре
              // больших размытых области на телефоне заметно роняют скролл.
              className="group relative isolate overflow-hidden rounded-2xl border border-white/12 bg-void/82 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-colors duration-500 ease-out-soft hover:border-white/22 hover:bg-void/88 active:border-white/22 active:bg-void/88 lg:p-9 lg:backdrop-blur-md"
            >
              <span
                aria-hidden="true"
                className="absolute top-0 bottom-0 left-0 w-px origin-top scale-y-0 bg-accent transition-transform duration-[600ms] ease-out-expo group-hover:scale-y-100 group-active:scale-y-100"
              />

              {/* Кадр из съёмки заказчика проступает у правого края при
                  наведении: утверждение в тексте подтверждается снимком,
                  а не остаётся словами. Пакшоты вырезаны по контуру и
                  ложатся предметом; репортажный кадр (`cover`) заполняет
                  ячейку целиком.

                  Яркость срезана до 0,4: текст ячейки идёт поверх, и на
                  полной яркости зелёная кромка корпуса давала под ним
                  контраст 3:1. С этой настройкой — 5:1, запас к AA. */}
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 767px) 60vw, 30vw"
                  className={`pointer-events-none -z-10 scale-105 opacity-0 transition-[opacity,scale] duration-700 ease-out-expo [filter:brightness(0.4)] [mask-image:linear-gradient(to_right,transparent,black_36%)] group-hover:scale-100 group-hover:opacity-[0.7] group-active:scale-100 group-active:opacity-[0.7] ${
                    item.cover ? "object-cover" : "object-contain object-right p-4"
                  }`}
                />
              ) : null}

              <p className="readout text-[clamp(1.75rem,3vw,2.25rem)] leading-none font-medium text-faint transition-colors duration-500 group-hover:text-accent group-active:text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="font-display mt-7 text-lg leading-snug font-semibold tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>

        {/* Четыре довода о компании — и выход на страницу, где о ней
            рассказано целиком. С главной на неё иначе не попасть. */}
        <Reveal className="mt-10 lg:mt-14">
          <ButtonLink href={home.sections.advantages.cta.href} variant="outline" arrow>
            {home.sections.advantages.cta.label}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
