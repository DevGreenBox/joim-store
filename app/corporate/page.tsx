import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
import { Reveal } from "@/components/ui/Reveal";
import corporate from "@/content/pages/corporate.json";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: corporate.title,
  description:
    "Оптовые поставки пусковых устройств JOIM автопаркам и дилерам, корпоративные подарки и брендирование корпуса от 50 штук.",
  alternates: { canonical: "/corporate" },
};

export default function CorporatePage() {
  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide" className="relative">
        <Breadcrumbs items={[{ label: "Компаниям" }]} />
        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-h1 font-semibold text-balance">
            {corporate.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {corporate.lead}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
          {corporate.offers.map((offer, index) => (
            <Reveal
              as="li"
              key={offer.title}
              delay={(index % 2) * 80}
              className="bg-surface p-6 lg:p-10"
            >
              <h2 className="font-display text-lg leading-snug font-semibold tracking-[-0.01em]">
                {offer.title}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {offer.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <section className="section-light py-16 lg:mt-[75px] lg:py-[75px]">
        <Container size="wide">
          <dl className="divide-y divide-line border-y border-line">
            {corporate.terms.map((term, index) => (
              <Reveal
                key={term.label}
                delay={index * 60}
                y={14}
                className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5"
              >
                <dt className="text-[14px] text-muted">{term.label}</dt>
                <dd className="readout text-[15px] text-ink">{term.value}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      <Container size="wide" className="lg:mt-[75px]">
        <Reveal className="rounded-2xl border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            {corporate.cta.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            {corporate.cta.text}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/contacts" arrow>
              Связаться
            </ButtonLink>
            <a
              href={`mailto:${site.email}`}
              className="num inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-medium transition-colors duration-300 hover:border-ink/60"
            >
              {site.email}
            </a>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
