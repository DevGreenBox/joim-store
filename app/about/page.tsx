import type { Metadata } from "next";

import { LeadForm } from "@/components/sections/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import about from "@/content/pages/about.json";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "О бренде",
  description:
    "JOIM — российский бренд автомобильной электроники: пусковые устройства Easy Start и автопылесос PVC-1. Собственное производство с 2019 года.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="pt-12 lg:pt-16">
      <Container size="wide">
        <Breadcrumbs items={[{ label: "О бренде" }]} />

        <div className="mt-7 max-w-3xl">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance">
            {about.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {about.lead}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-20">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {site.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70} className="bg-surface p-6 lg:p-8">
              <dt className="num font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em]">
                {stat.value}
                <span className="text-lg font-medium text-faint">
                  {stat.suffix}
                </span>
              </dt>
              <dd className="mt-3 text-[13px] leading-snug text-muted">
                {stat.label}
              </dd>
            </Reveal>
          ))}
        </dl>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-32">
        <div className="grid gap-14 lg:grid-cols-3">
          {about.blocks.map((block, index) => (
            <Reveal key={block.title} delay={index * 90}>
              <span className="num font-display text-sm font-medium text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display mt-5 text-xl leading-snug font-semibold tracking-[-0.02em]">
                {block.title}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {block.text}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-32">
        <h2 className="eyebrow mb-8">Команда</h2>
        <ul className="divide-y divide-line border-y border-line">
          {about.team.map((member, index) => (
            <Reveal
              as="li"
              key={member.name}
              delay={index * 60}
              y={14}
              className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-6"
            >
              <h3 className="font-display text-base font-semibold tracking-[-0.01em]">
                {member.name}
              </h3>
              <p className="text-[13px] text-muted">{member.role}</p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <LeadForm />
    </div>
  );
}
