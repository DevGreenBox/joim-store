import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import home from "@/content/pages/home.json";
import { site } from "@/lib/site";

/**
 * История компании: год основания крупно, довод рядом, выход на страницу
 * о бренде.
 *
 * Кадр репортажный — человек у открытого капота из съёмки заказчика:
 * страница о компании начинается не с офиса, а с того, где устройством
 * пользуются.
 */
export function BrandStory() {
  const { story } = home.sections;
  const founded = site.stats.find((stat) => stat.count === false);

  return (
    <section className="section-light py-16 lg:py-[75px]">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <span aria-hidden="true" className="gauge accent-rule mb-6" />

            {founded ? (
              <p className="num font-display text-[clamp(3.5rem,9vw,6rem)] leading-none font-semibold tracking-[-0.04em]">
                <CountUp value={founded.value} />
              </p>
            ) : null}

            <h2 className="font-display mt-6 text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-balance">
              {story.title}
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              {story.text}
            </p>

            <div className="mt-9">
              <ButtonLink href={story.cta.href} variant="outline" arrow>
                {story.cta.label}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal
            delay={120}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line"
          >
            <Image
              src="/images/hero/advantages.webp"
              alt="Человек у открытого капота с пусковым устройством JOIM"
              fill
              sizes="(max-width: 1023px) 100vw, 44vw"
              className="object-cover object-[38%_44%]"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
