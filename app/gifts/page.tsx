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

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance">
            {gifts.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {gifts.lead}
          </p>
        </div>
      </Container>

      {/* Кейс крупно: подарок узнают по упаковке, а не по прибору */}
      <Container size="wide" className="mt-12 lg:mt-[150px]">
        <Reveal className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
          />
          <div className="relative aspect-[16/10] sm:aspect-[21/9]">
            <Image
              src="/images/products/joim-es29-kit.webp"
              alt="Кейс JOIM Easy Start: устройство, клеммы, провода и адаптер по местам"
              fill
              sizes="(max-width: 1023px) 100vw, 1400px"
              className="object-contain p-8 lg:p-12"
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
          <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em]">
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
