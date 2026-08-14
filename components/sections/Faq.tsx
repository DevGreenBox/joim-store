import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";

/**
 * Аккордеон на нативном <details>: раскрывается без JS, доступен с клавиатуры
 * и остаётся рабочим, даже если скрипты не загрузились.
 */
export function Faq() {
  return (
    <section className="py-16 lg:py-[75px]">
      <Container size="wide" className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeading
          title={home.sections.faq.title}
          text={home.sections.faq.text}
          className="lg:block"
        />

        <ul className="divide-y divide-line border-y border-line">
          {home.faq.map((item, index) => (
            <Reveal as="li" key={item.q} delay={index * 60} y={14}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-base leading-snug font-semibold tracking-[-0.01em] transition-colors duration-300 group-hover:text-accent group-active:text-accent lg:text-lg">
                    {item.q}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="relative mt-1 grid size-6 shrink-0 place-items-center"
                  >
                    <span className="absolute h-px w-3.5 bg-muted" />
                    <span className="absolute h-px w-3.5 rotate-90 bg-muted transition-transform duration-500 ease-out-expo group-open:rotate-0" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 text-[14px] leading-relaxed text-muted group-open:animate-rise">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
