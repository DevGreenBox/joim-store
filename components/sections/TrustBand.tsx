"use client";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PosterVideo } from "@/components/ui/PosterVideo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";
import type { Product } from "@/lib/types";

/**
 * Блок доверия: видео об устройствах и выход на ленту отзывов.
 *
 * `preload="none"` и постер картинкой: до нажатия браузер не качает
 * ни байта. Три ролика по несколько мегабайт, а доскроллит сюда
 * меньшинство — тянуть их всем незачем.
 *
 * Ролики сейчас брендовые, из материалов заказчика. Обзоров от блогеров
 * и видео от покупателей в библиотеке нет: появятся файлы — лягут сюда
 * же, разметка на это рассчитана.
 */
export function TrustBand({ products }: { products: Product[] }) {
  const clips = products.filter((product) => product.video).slice(0, 3);
  if (clips.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface py-16 lg:py-[75px]">
      <Container size="wide">
        <SectionHeading
          title={home.sections.trust.title}
          text={home.sections.trust.text}
          action={
            <ButtonLink
              href={home.sections.trust.cta.href}
              variant="outline"
              arrow
            >
              {home.sections.trust.cta.label}
            </ButtonLink>
          }
        />

        <ul className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {clips.map((product, index) => (
            <Reveal
              as="li"
              key={product.slug}
              delay={index * 80}
              className="overflow-hidden rounded-2xl border border-line bg-surface-2"
            >
              {/* Одно соотношение на все три: у роликов оно разное
                  (ES-19 горизонтальный, два соседних вертикальные),
                  а строка грида тянет карточки по высоте — под средней
                  зияло 300 px пустоты. Кадр вписывается по постеру. */}
              <PosterVideo
                src={product.video!.src}
                poster={product.video!.poster}
                className="aspect-[4/5] object-cover"
              />

              <div className="p-6">
                <p className="readout text-[11px] tracking-[0.12em] text-accent uppercase">
                  {product.name}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {product.video!.text ?? product.short}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
