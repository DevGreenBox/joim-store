import type { Metadata } from "next";

import { LeadForm } from "@/components/sections/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
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
      <Container size="wide" className="relative">
        <Breadcrumbs items={[{ label: "О бренде" }]} />

        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-h1 font-semibold text-balance">
            {about.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {about.lead}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {site.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70} className="bg-surface p-6 lg:p-8">
              <dt className="num font-display text-h2 font-semibold">
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

      {/* Миссия и принципы — прямое требование структуры заказчика
          (п. 4.4: «преимущества компании, ценности, миссия»). Светлая
          плашка здесь работает дважды: даёт заявлению вес сменой грунта
          и добавляет странице то самое чередование цветов по блокам,
          о котором заказчик написал отдельно.

          История бренда переехала сюда из списка ниже: под заголовком
          «Принципы» рассказ о происхождении был не на месте, а рядом
          с миссией он и есть её обоснование. */}
      <section className="section-light mt-16 py-16 lg:mt-[150px] lg:py-[75px]">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div>
              <span aria-hidden="true" className="accent-rule mb-6" />
              <p className="eyebrow mb-5">{about.mission.eyebrow}</p>
              <h2 className="font-display text-h2 leading-[1.08] font-semibold text-balance">
                {about.mission.title}
              </h2>
            </div>
            <div className="lg:pt-2">
              <p className="text-[17px] leading-relaxed lg:text-[19px]">
                {about.mission.text}
              </p>
              <p className="mt-6 text-[14px] leading-relaxed text-muted lg:text-[15px]">
                {about.mission.origin}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Пунктов четыре, а колонок было три: три вставали в ряд,
          четвёртый оставался один и справа от него зияли две пустые
          колонки. Колоночная сетка тут вообще не годится — тексты
          разной длины, низ у колонок рваный, а заголовки на узких
          экранах переносятся вразнобой, и абзацы стартуют с разной
          высоты.

          Строками этой беды нет: каждая строка выравнивает свои две
          половины сама, а линейки держат последовательность. Нумерация
          читается как порядок, чем она и является. */}
      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <h2 className="eyebrow mb-6">{about.valuesTitle}</h2>
        <ol className="border-t border-line">
          {about.blocks.map((block, index) => (
            <Reveal
              as="li"
              key={block.title}
              delay={index * 70}
              y={14}
              className="grid gap-x-10 gap-y-4 border-b border-line py-8 lg:grid-cols-[3.5rem_1fr_1.4fr] lg:gap-y-0 lg:py-10"
            >
              <span className="num text-[12px] font-medium tracking-[0.08em] text-accent lg:pt-2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl leading-snug font-semibold tracking-[-0.02em]">
                {block.title}
              </h3>
              <p className="max-w-[36rem] text-[14px] leading-relaxed text-muted lg:text-[15px]">
                {block.text}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>

      <Container size="wide" className="lg:mb-[75px] mt-16 lg:mt-[150px]">
        <h2 className="eyebrow mb-6">Команда</h2>
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
