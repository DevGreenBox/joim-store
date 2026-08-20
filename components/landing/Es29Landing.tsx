import Image from "next/image";

import { Slab } from "@/components/landing/Slab";
import { ProductVideo } from "@/components/sections/ProductVideo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductBuy } from "@/components/ui/ProductBuy";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { StarMark } from "@/components/ui/StarMark";
import copy from "@/content/landing/es29.json";
import { formatPrice, plural } from "@/lib/format";
import { getReviews } from "@/lib/reviews";
import type { Product } from "@/lib/types";

/*
  КОНТРАКТ НАПРАВЛЕНИЯ — мини-лендинг ES-29 (20.08.2026)

  ТЕЗИС: страница модели — не карточка товара с блоками, а серия сцен,
  где показание набрано во всю ширину, а прибор стоит перед ним
  и перекрывает его собой. Отказ от каталожной раскладки «галерея слева,
  характеристики справа, дальше плитки».

  МИР: фирменный графит JOIM и один зелёный акцент. Rubik за 100 px
  с трекингом −0,05em как конструкция, Geist Mono вразрядку как подпись,
  между ними пусто. Вместо карточек — волосяные линии и полосы.
  Разбор — docs/design/landing-system.md.

  ИСТОРИЯ: человек видит цифру, понимает запас, доходит до разреза
  и защит, убеждается, что это не коробка с китайского склада, и берёт.

  ПЕРВЫЙ ЭКРАН: «5000» во всю ширину, прибор по центру перекрывает
  середину слова, под ним волосяная полоса показаний и цена с кнопкой.

  ФОРМА: типографическая архитектура — четвёртая из семи разобранных
  структур, назначена жеребьёвкой (ключ a815374e).
*/

/** Полоса показаний: ячейки через волосяную линию, без плашек. */
function Strip({
  items,
  className = "",
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-2 gap-px overflow-hidden border-y border-line bg-line md:grid-cols-4 ${className}`}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-void px-5 py-7 lg:px-7 lg:py-9">
          <dt className="readout text-[11px] tracking-[0.16em] text-faint uppercase">
            {item.label}
          </dt>
          <dd className="font-display mt-4 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none font-semibold tracking-[-0.02em]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Es29Landing({ product }: { product: Product }) {
  const reviews = getReviews(product.slug);
  const specs = product.specs;

  return (
    <>
      {/* 1. Пять тысяч ампер — сцена со словом-конструкцией */}
      <section className="relative overflow-clip pt-6 pb-16 lg:pt-10 lg:pb-[75px]">
        <StarMark
          aria-hidden="true"
          className="pointer-events-none absolute -top-[18%] -right-[12%] -z-10 aspect-square w-[46%] rotate-[-12deg] text-accent/[0.05]"
        />

        <Container size="wide">
          <h1 className="font-display max-w-md text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {product.name}
          </h1>

          {/* Слово и прибор — центр экрана. Прибор выходит за нижний край
              слова: так видно, что он стоит перед ним, а не внутри. */}
          <Slab
            word={copy.hero.word}
            src="/images/products/joim-es29-front.webp"
            alt={`${product.name} — вид спереди`}
            width={493}
            height={1019}
            figure="w-[52%] sm:w-[38%] lg:w-[30%]"
            imageSizes="(max-width: 639px) 52vw, (max-width: 1023px) 38vw, 30vw"
            place="left-1/2 -translate-x-1/2 -top-[22%] -bottom-[52%]"
            tone="text-surface-2"
            className="mt-10 lg:mt-14"
            eager
            entrance={false}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -bottom-40 -z-10 h-72 bg-[radial-gradient(58%_100%_at_50%_0%,rgba(153,196,83,0.14),transparent_70%)]"
            />
          </Slab>

          <div className="relative z-10 mt-[36%] flex flex-col items-center gap-9 sm:mt-[26%] lg:mt-[22%]">
            <p className="max-w-md text-center text-[15px] leading-relaxed text-muted lg:text-[17px]">
              {copy.hero.lead}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <p className="num font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold">
                {formatPrice(product.price)}
              </p>
              <ProductBuy slug={product.slug} inStock={product.inStock} />
            </div>
          </div>
        </Container>

        <Container size="wide" className="mt-16 lg:mt-[75px]">
          <Strip
            items={product.highlights.map((item) => ({
              label: item.label,
              value: item.unit ? `${item.value} ${item.unit}` : item.value,
            }))}
          />
        </Container>
      </section>

      {/* 2. Мороз — сцена с кадром в руках, слово уходит за него */}
      <section className="relative overflow-clip bg-[#0b0d0d] py-16 lg:py-[75px]">
        <Container size="wide">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
            <Slab
              word={copy.cold.word}
              src="/images/products/joim-es29-hands.webp"
              alt="JOIM Easy Start ES-29 в руках у открытого капота"
              width={900}
              height={1200}
              figure="w-[40%] sm:w-[34%]"
              imageSizes="(max-width: 639px) 40vw, (max-width: 1023px) 34vw, 20vw"
              place="left-[56%] -translate-x-1/2 -top-[30%] -bottom-[30%]"
              tone="text-white/[0.16]"
            />

            <div className="lg:pb-10">
              <span aria-hidden="true" className="accent-rule mb-7 block" />
              <h2 className="font-display text-h2 font-semibold text-balance">
                {copy.cold.title}
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted lg:text-[17px]">
                {copy.cold.text}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Разрез — светлая полоса, техническая иллюстрация */}
      <section className="section-light py-16 lg:py-[75px]">
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <span aria-hidden="true" className="accent-rule mb-7 block" />
              <h2 className="font-display text-h2 font-semibold text-balance">
                {copy.inside.title}
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted lg:text-[17px]">
                {copy.inside.text}
              </p>

              <dl className="mt-10 border-t border-line">
                {copy.inside.parts.map((part) => (
                  <div
                    key={part.label}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                  >
                    <dt className="text-[15px] text-ink">{part.label}</dt>
                    <dd className="readout text-[13px] text-muted">
                      {part.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Reveal className="relative aspect-[4/3]">
              <Image
                src="/images/products/joim-es29-1.webp"
                alt="JOIM Easy Start ES-29 в разрезе: ячейки, плата, клеммы и корпус"
                fill
                sizes="(max-width: 1023px) 92vw, 52vw"
                className="object-contain"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 4. Защиты — сетка на волосяных линиях, без плашек */}
      <section className="py-16 lg:py-[75px]">
        <Container size="wide">
          <div className="max-w-2xl">
            <span aria-hidden="true" className="accent-rule mb-7 block" />
            <h2 className="font-display text-h2 font-semibold text-balance">
              {copy.guards.title}
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-muted lg:text-[17px]">
              {copy.guards.text}
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {(product.protections ?? []).map((item) => (
              <Reveal
                key={item}
                y={12}
                className="flex min-h-[132px] items-end bg-void px-5 py-6 lg:px-7 lg:py-8"
              >
                <p className="font-display text-[clamp(1.125rem,1.6vw,1.375rem)] leading-snug font-semibold tracking-[-0.01em]">
                  {item}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Фонарь — самая тёмная сцена лендинга */}
      <section className="relative overflow-clip bg-[#070808] py-16 lg:py-[75px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[420px] -translate-y-1/2 bg-[radial-gradient(50%_60%_at_50%_50%,rgba(153,196,83,0.12),transparent_70%)]"
        />
        <Container size="wide">
          <Slab
            word={copy.lamp.word}
            src="/images/products/joim-es29-2.webp"
            alt="Фонарь JOIM Easy Start ES-29 в работе"
            width={1200}
            height={768}
            figure="w-[74%] sm:w-[58%] lg:w-[46%]"
            imageSizes="(max-width: 639px) 74vw, (max-width: 1023px) 58vw, 46vw"
            place="left-1/2 -translate-x-1/2 top-[6%] -bottom-[18%]"
            tone="text-white/[0.10]"
          />

          <div className="mt-[22%] grid gap-10 sm:mt-[16%] lg:mt-[12%] lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <h2 className="font-display text-h2 font-semibold text-balance">
                {copy.lamp.title}
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted lg:text-[17px]">
                {copy.lamp.text}
              </p>
            </div>

            <ul className="flex flex-wrap gap-3">
              {copy.lamp.modes.map((mode) => (
                <li
                  key={mode}
                  className="readout rounded-full border border-line-strong px-5 py-2.5 text-[12px] tracking-[0.08em] text-muted uppercase"
                >
                  {mode}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* 6. Разъёмы — макро во всю ячейку и список через линию */}
      <section className="py-16 lg:py-[75px]">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface">
              <Image
                src="/images/products/joim-es29-ports.webp"
                alt="Разъёмы JOIM Easy Start ES-29 крупным планом"
                fill
                sizes="(max-width: 1023px) 92vw, 55vw"
                className="object-cover"
              />
            </Reveal>

            <div>
              <span aria-hidden="true" className="accent-rule mb-7 block" />
              <h2 className="font-display text-h2 font-semibold text-balance">
                {copy.ports.title}
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-muted lg:text-[17px]">
                {copy.ports.text}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. Комплект — вторая светлая полоса */}
      <section className="section-light py-16 lg:py-[75px]">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
            <div>
              <span aria-hidden="true" className="accent-rule mb-7 block" />
              <h2 className="font-display text-h2 font-semibold text-balance">
                {copy.kit.title}
              </h2>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted lg:text-[17px]">
                {copy.kit.text}
              </p>

              <ol className="mt-10 border-t border-line">
                {product.included.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-5 border-b border-line py-4"
                  >
                    <span className="readout w-6 shrink-0 text-[12px] text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] text-ink">{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Reveal className="relative aspect-[4/3]">
              <Image
                src="/images/products/joim-es29-set.webp"
                alt="Комплект JOIM Easy Start ES-29: устройство, клеммы, адаптер и кейс"
                fill
                sizes="(max-width: 1023px) 92vw, 58vw"
                className="object-contain"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 8. Характеристики — вторая полоса показаний, длиннее первой */}
      <section className="py-16 lg:py-[75px]">
        <Container size="wide">
          <dl className="grid gap-px overflow-hidden border-y border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="bg-void px-5 py-6 lg:px-7 lg:py-8"
              >
                <dt className="readout text-[11px] tracking-[0.16em] text-faint uppercase">
                  {spec.label}
                </dt>
                <dd className="mt-3 text-[15px] leading-snug text-ink">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* 9. Кому эта модель — развилка на две колонки, без плашек */}
      <section className="py-16 lg:py-[75px]">
        <Container size="wide">
          <div className="grid gap-10 border-t border-line pt-10 lg:grid-cols-2 lg:gap-16 lg:pt-14">
            <div>
              <p className="readout text-[11px] tracking-[0.16em] text-accent uppercase">
                {copy.fork.takeLabel}
              </p>
              <p className="font-display mt-5 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-semibold tracking-[-0.02em]">
                {product.fits.who}
              </p>
            </div>

            {product.fits.skip ? (
              <div>
                <p className="readout text-[11px] tracking-[0.16em] text-faint uppercase">
                  {copy.fork.skipLabel}
                </p>
                <p className="mt-5 text-[15px] leading-relaxed text-muted lg:text-[17px]">
                  {product.fits.skip}
                </p>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {/* 10. Ролик */}
      {product.video ? (
        <section className="py-16 lg:py-[75px]">
          <ProductVideo
            title={product.video.title}
            text={product.video.text}
            video={product.video}
          />
        </section>
      ) : null}

      {/* 11. Отзывы владельцев */}
      {reviews && reviews.items.length > 0 ? (
        <section className="py-16 lg:py-[75px]">
          <Container size="wide">
            <div className="flex flex-wrap items-end justify-between gap-6">
              {/* Балл и число берём из карточки товара: 5,0 по своей ленте.
                  Сводные оценки площадок заказчик просил не показывать. */}
              <h2 className="font-display text-h2 font-semibold">
                {product.rating.toFixed(1).replace(".", ",")} из 5 —{" "}
                {product.reviews}{" "}
                {plural(product.reviews, "отзыв", "отзыва", "отзывов")}
              </h2>
              <ButtonLink href="/reviews" variant="outline" size="sm" arrow>
                Все отзывы
              </ButtonLink>
            </div>

            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
              {reviews.items.slice(0, 3).map((review, index) => (
                <Reveal
                  as="li"
                  key={`${review.name}-${review.date}`}
                  delay={index * 70}
                >
                  <ReviewCard review={review} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* 12. Финал — цена, кнопка и условия одной строкой */}
      <section className="relative overflow-clip py-16 lg:py-[75px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
        />
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <span aria-hidden="true" className="accent-rule mb-7 block" />
              <h2 className="font-display text-h2 font-semibold text-balance">
                {copy.close.title}
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted lg:text-[17px]">
                {copy.close.text}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <p className="num font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold">
                {formatPrice(product.price)}
              </p>
              <ProductBuy slug={product.slug} inStock={product.inStock} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
