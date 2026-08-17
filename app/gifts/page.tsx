import type { Metadata } from "next";
import Image from "next/image";

import { LeadForm } from "@/components/sections/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import gifts from "@/content/pages/gifts.json";
import { getProducts } from "@/lib/catalog";

/**
 * Подарки частным лицам — вторая половина развилки с главной. Первая
 * ведёт на «Компаниям»: у частного подарка и корпоративной закупки
 * разные вопросы, и общая страница заставляла бы выбирать дважды.
 *
 * Структура заказчика (17.08, п. 4.7): акцент на дизайне, упаковке
 * и на том, что устройство «идеально как подарок».
 */

export const metadata: Metadata = {
  title: "Подарок автомобилисту — пусковое устройство JOIM",
  description:
    "Пусковое устройство в подарок: жёсткий кейс, заряжено с завода, гарантия год. Поможем выбрать модель под машину и собрать заказ к дате.",
  alternates: { canonical: "/gifts" },
};

export default function GiftsPage() {
  const products = getProducts();

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide" className="relative">
        <Breadcrumbs items={[{ label: "Подарки" }]} />
        <PageMark />

      </Container>

      {/* Заголовок и кадр одним блоком. Раньше это были две вещи подряд:
          текст, а под ним декоративная полоса 21:9 с пакшотом. Кадр
          с сиденья вертикальный, в полосу он не влезает — зато встаёт
          колонкой рядом с текстом, и первый экран становится одним
          высказыванием вместо двух. */}
      <Container size="wide" className="mt-10 lg:mt-14">
        <Reveal className="relative isolate grid overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[1.05fr_1fr]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
          />

          <div className="flex flex-col justify-center p-8 lg:p-14">
            <span aria-hidden="true" className="gauge accent-rule mb-6" />
            <h1 className="font-display text-h1 font-semibold text-balance">
              {gifts.title}
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
              {gifts.lead}
            </p>
          </div>

          {/* Высота задана ячейке, а не тексту: кадр вертикальный, и в полосе
              по высоте текста от него оставалась бы середина. */}
          <div className="relative min-h-[340px] sm:min-h-[420px] lg:min-h-[480px]">
            <Image
              src="/images/products/es29-seat.webp"
              alt="Два пусковых устройства JOIM Easy Start и кейс на пассажирском сиденье"
              fill
              sizes="(max-width: 1023px) 100vw, 48vw"
              preload
              className="object-cover"
            />
          </div>
        </Reveal>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
          {gifts.reasons.map((reason, index) => (
            <Reveal
              as="li"
              key={reason.title}
              delay={(index % 2) * 80}
              className="bg-surface p-6 lg:p-10"
            >
              <h2 className="font-display text-lg leading-snug font-semibold tracking-[-0.01em]">
                {reason.title}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {reason.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <h2 className="eyebrow mb-6">Поводы</h2>
        <dl className="divide-y divide-line border-y border-line">
          {gifts.occasions.map((item, index) => (
            <Reveal
              key={item.label}
              delay={index * 60}
              y={14}
              className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5"
            >
              <dt className="text-[15px] text-ink">{item.label}</dt>
              <dd className="max-w-md text-[14px] text-muted">{item.text}</dd>
            </Reveal>
          ))}
        </dl>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <Reveal>
          <span aria-hidden="true" className="gauge accent-rule mb-6" />
          <h2 className="font-display text-h2 font-semibold">
            {gifts.pick.title}
          </h2>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
            {gifts.pick.text}
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <Reveal as="li" key={product.slug} delay={index * 70}>
              <ProductCard product={product} eager={index < 3} />
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <Reveal className="rounded-2xl border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            {gifts.cta.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            {gifts.cta.text}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/catalog" arrow>
              Выбрать модель
            </ButtonLink>
            <ButtonLink href="/corporate" variant="outline">
              Дарим от компании
            </ButtonLink>
          </div>
        </Reveal>
      </Container>

      <div className="lg:mt-[75px]">
        <LeadForm />
      </div>
    </div>
  );
}
