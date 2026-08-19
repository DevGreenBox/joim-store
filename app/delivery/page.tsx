import type { Metadata } from "next";

import { LeadForm } from "@/components/sections/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
import { Reveal } from "@/components/ui/Reveal";
import delivery from "@/content/pages/delivery.json";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description:
    "Самовывоз, курьер по Москве, СДЭК и Почта России. Бесплатная доставка от 15 000 ₽, оплата картой, наличными, по счёту и в рассрочку.",
  alternates: { canonical: "/delivery" },
};

export default function DeliveryPage() {
  return (
    <div className="pt-12 lg:pt-16">
      <Container size="wide" className="relative">
        <Breadcrumbs items={[{ label: "Доставка и оплата" }]} />

        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-h1 font-semibold text-balance">
            {delivery.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {delivery.lead}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <h2 className="eyebrow mb-6">Способы доставки</h2>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {delivery.delivery.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={(index % 2) * 70}
              className="bg-surface p-6 lg:p-10"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="font-display text-lg font-semibold tracking-[-0.01em]">
                  {item.title}
                </h3>
                <span className="num text-[13px] whitespace-nowrap text-accent">
                  {item.price}
                </span>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <section className="section-light py-16 lg:mt-[75px] lg:py-[75px]">
        <Container size="wide">
          <ul className="divide-y divide-line border-y border-line">
            {delivery.payment.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                delay={index * 60}
                y={14}
                className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2 py-6"
              >
                <h3 className="font-display min-w-[240px] flex-1 text-base font-semibold tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="max-w-md flex-1 text-[14px] leading-relaxed text-muted">
                  {item.text}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <Container size="wide" className="lg:mt-[75px] lg:mb-[75px]">
        <Reveal className="rounded-2xl border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            {delivery.returns.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            {delivery.returns.text}
          </p>
        </Reveal>
      </Container>

      <div className="mt-16 lg:mt-[75px]">
        <LeadForm />
      </div>
    </div>
  );
}
