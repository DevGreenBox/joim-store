import type { Metadata } from "next";

import { CtaBand } from "@/components/sections/CtaBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import warranty from "@/content/pages/warranty.json";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: warranty.title,
  description:
    "12 месяцев гарантии на пусковые устройства и пылесос JOIM. Брак меняем без экспертизы, возврат в течение 14 дней.",
  alternates: { canonical: "/warranty" },
};

export default function WarrantyPage() {
  const support = site.socials.find((s) => s.href.includes("support"));

  return (
    <div className="pt-12 lg:pt-16">
      <Container size="wide">
        <Breadcrumbs items={[{ label: warranty.title }]} />
        <div className="mt-7 max-w-3xl">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance">
            {warranty.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {warranty.lead}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-20">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
          {warranty.blocks.map((block, index) => (
            <Reveal
              as="li"
              key={block.title}
              delay={(index % 2) * 80}
              className="bg-surface p-6 lg:p-10"
            >
              <h2 className="font-display text-lg leading-snug font-semibold tracking-[-0.01em]">
                {block.title}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {block.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-32">
        <h2 className="eyebrow mb-10">Как проходит обращение</h2>
        <ol className="relative grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[7px] right-0 left-0 hidden h-px bg-[linear-gradient(to_right,var(--color-line-strong),var(--color-line-strong)_75%,transparent)] lg:block"
          />
          {warranty.steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.step}
              delay={index * 90}
              className="relative"
            >
              <span
                aria-hidden="true"
                className="relative z-10 mb-7 block size-[15px] rounded-full border border-accent/50 bg-void before:absolute before:inset-[3px] before:rounded-full before:bg-accent"
              />
              <p className="num text-[11px] font-medium tracking-[0.18em] text-faint">
                {step.step}
              </p>
              <h3 className="font-display mt-3 text-lg leading-snug font-semibold tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {step.text}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>

      <Container size="wide" className="mt-24">
        <Reveal className="rounded-2xl border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            {warranty.returns.title}
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">
            {warranty.returns.text}
          </p>
          {support ? (
            <p className="mt-6 text-[13px] text-faint">
              Обращения:{" "}
              <a
                href={support.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-ink transition-colors duration-300 hover:text-accent"
              >
                {support.label}
              </a>
            </p>
          ) : null}
        </Reveal>
      </Container>

      <div className="mt-16 lg:mt-32">
        <CtaBand />
      </div>
    </div>
  );
}
