import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTrack } from "@/components/ui/ScrollTrack";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";

export function Process() {
  return (
    <section className="py-16 lg:py-32">
      <Container size="wide">
        <SectionHeading
          eyebrow={home.sections.process.eyebrow}
          title={home.sections.process.title}
          text={home.sections.process.text}
        />

        {/* Шкала: линия наливается акцентом, а точки загораются по мере
            прохождения секции — как заполняется индикатор на приборной
            панели. Значение `--track` пишет ScrollTrack, всё остальное
            считает CSS, поэтому во время скролла ничего не перерисовывается. */}
        <ScrollTrack
          as="ol"
          className="relative mt-10 grid gap-10 lg:mt-16 lg:gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[7px] right-0 left-0 hidden h-px bg-line-strong lg:block"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[7px] right-0 left-0 hidden h-px origin-left bg-accent lg:block"
            style={{ transform: "scaleX(var(--track))" }}
          />

          {home.process.map((step, index) => (
            <Reveal
              key={step.step}
              as="li"
              delay={index * 90}
              className="relative"
            >
              <span
                aria-hidden="true"
                className="relative z-10 mb-7 block size-[15px] rounded-full border border-line-strong bg-void"
              >
                <span
                  className="absolute inset-[3px] rounded-full bg-accent"
                  style={{
                    // Точка зажигается, когда шкала дошла до её деления.
                    opacity: `clamp(0, calc((var(--track) - ${(
                      index / home.process.length
                    ).toFixed(3)}) * 12), 1)`,
                  }}
                />
              </span>
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
        </ScrollTrack>
      </Container>
    </section>
  );
}
