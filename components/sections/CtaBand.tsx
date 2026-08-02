import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import home from "@/content/pages/home.json";
import { site } from "@/lib/site";

export function CtaBand() {
  return (
    <section className="pb-16 lg:pb-32">
      <Container size="wide">
        <Reveal className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 text-center lg:px-16 lg:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-1/2 -z-10 h-[560px] animate-drift bg-[radial-gradient(closest-side,rgba(140,197,63,0.14),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-50"
          />

          <p className="eyebrow">{home.sections.cta.eyebrow}</p>
          <h2 className="font-display mx-auto mt-6 max-w-3xl text-[clamp(1.75rem,4.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {home.sections.cta.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            {home.sections.cta.text}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/catalog" size="lg" arrow>
              Выбрать модель
            </ButtonLink>
            <a
              href={`tel:${site.phoneHref}`}
              className="num inline-flex h-13 items-center rounded-full border border-line-strong px-8 text-[15px] font-medium transition-[border-color,background-color] duration-300 ease-out-soft hover:border-ink/60 hover:bg-white/[0.04]"
            >
              {site.phone}
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
