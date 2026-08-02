import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import home from "@/content/pages/home.json";
import { site } from "@/lib/site";

const { hero } = home;

export function Hero() {
  const [titleTop, titleBottom] = hero.title.split("\n");

  return (
    <section className="relative isolate overflow-hidden">
      {/* Слои фона. Всё на CSS: ни одной картинки и ни одного запроса. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 grid-lines mask-fade-y opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 -z-10 h-[820px] w-[1100px] -translate-x-1/2 animate-drift rounded-full bg-[radial-gradient(closest-side,rgba(140,197,63,0.13),rgba(140,197,63,0.04)_45%,transparent_72%)] blur-[2px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-[linear-gradient(to_top,var(--color-void),transparent)]"
      />

      <Container
        size="wide"
        className="grid gap-12 pt-12 pb-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10 lg:pt-24 lg:pb-28"
      >
        <div>
          <p
            className="eyebrow inline-flex items-center gap-2.5 animate-rise"
            style={{ animationDelay: "60ms" }}
          >
            <span className="inline-block size-1.5 rounded-full bg-accent animate-sheen" />
            {hero.eyebrow}
          </p>

          <h1 className="font-display mt-7 text-[clamp(2.5rem,7.2vw,5rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-balance">
            <span
              className="block animate-rise"
              style={{ animationDelay: "140ms" }}
            >
              {titleTop}
            </span>
            <span
              className="block animate-rise text-muted"
              style={{ animationDelay: "240ms" }}
            >
              {titleBottom}
            </span>
          </h1>

          <p
            className="mt-8 max-w-xl text-[15px] leading-relaxed text-muted animate-rise sm:text-base"
            style={{ animationDelay: "340ms" }}
          >
            {hero.lead}
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-3 animate-rise"
            style={{ animationDelay: "430ms" }}
          >
            <ButtonLink href={hero.primaryCta.href} size="lg" arrow>
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink
              href={hero.secondaryCta.href}
              size="lg"
              variant="outline"
            >
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>

          <ul
            className="mt-10 flex flex-wrap gap-x-7 gap-y-3 animate-rise"
            style={{ animationDelay: "520ms" }}
          >
            {hero.marks.map((mark) => (
              <li
                key={mark}
                className="flex items-center gap-2.5 text-[13px] text-faint"
              >
                <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
                  <path
                    d="m2 6.2 2.6 2.6L10 3.4"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {mark}
              </li>
            ))}
          </ul>
        </div>

        {/* Визуал: кольца, медленно вращающаяся риска и иллюстрация */}
        <div
          className="relative mx-auto aspect-square w-full max-w-[460px] animate-fade lg:max-w-none"
          style={{ animationDelay: "300ms" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-[8%] rounded-full border border-line"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[20%] rounded-full border border-line"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[32%] rounded-full border border-line-strong"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[8%] animate-spin-slow rounded-full border border-transparent [background:conic-gradient(from_0deg,transparent_0deg,rgba(140,197,63,0.55)_18deg,transparent_38deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-1.5px),#000_calc(100%-1.5px))]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[26%] rounded-full bg-[radial-gradient(closest-side,rgba(140,197,63,0.16),transparent_70%)]"
          />

          {/* Реальное фото товара, а не иллюстрация. Единственная картинка
              первого экрана и заведомый LCP — поэтому preload, то есть
              <link> в head. В Next 16 он пришёл на смену priority. */}
          <Image
            src="/images/products/joim-es19-1.webp"
            alt="Пусковое устройство JOIM Easy Start ES-19"
            width={568}
            height={1200}
            preload
            sizes="(min-width: 1024px) 460px, 70vw"
            className="absolute inset-[24%] size-[52%] object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.75)]"
          />

          <p className="readout absolute top-[6%] left-0 rounded-full border border-line bg-surface/70 px-3.5 py-2 text-[11px] tracking-wide text-muted backdrop-blur-sm">
            3300 А · 29 600 мВт·ч
          </p>
          {/* Моноширинным набирается только то, что действительно показание:
              токи, ёмкости, артикулы. Обычная фраза остаётся текстом. */}
          <p className="absolute right-0 bottom-[16%] rounded-full border border-line bg-surface/70 px-3.5 py-2 text-[12px] text-muted backdrop-blur-sm">
            Заводит с нуля
          </p>
        </div>
      </Container>

      {/* Полоса цифр */}
      <Container size="wide">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {site.stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-surface p-6 animate-fade lg:p-8"
              style={{ animationDelay: `${600 + index * 80}ms` }}
            >
              <dt className="num font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em]">
                {/* Год основания не отсчитываем: это дата, а не показание. */}
                {stat.count === false ? (
                  stat.value
                ) : (
                  <CountUp value={stat.value} />
                )}
                <span className="text-lg font-medium text-faint">
                  {stat.suffix}
                </span>
              </dt>
              <dd className="mt-3 text-[13px] leading-snug text-muted">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
