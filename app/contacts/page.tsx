import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Как связаться с JOIM: ${site.phone}, ${site.email}. ${site.hours}.`,
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    description: site.description,
    telephone: site.phone,
    email: site.email,
    url: site.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      streetAddress: "ул. Автозаводская, 23к2",
      addressCountry: "RU",
    },
    openingHours: "Mo-Su 09:00-21:00",
  };

  const rows = [
    { label: "Телефон", value: site.phone, href: `tel:${site.phoneHref}` },
    { label: "Почта", value: site.email, href: `mailto:${site.email}` },
    { label: "Адрес", value: site.address },
    { label: "Часы работы", value: site.hours },
  ];

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container size="wide">
        <Breadcrumbs items={[{ label: "Контакты" }]} />

        <div className="mt-7 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance">
              Приезжайте или звоните
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
              Пишите в мессенджеры — отвечаем сами и быстро. Если нужен
              счёт на юрлицо или оптовая поставка, лучше на почту.
            </p>

            <dl className="mt-10 divide-y divide-line border-y border-line">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-5"
                >
                  <dt className="text-[13px] text-faint">{row.label}</dt>
                  <dd className="num text-[15px]">
                    {row.href ? (
                      <a
                        href={row.href}
                        className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-accent lg:min-h-0"
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/checkout" arrow>
                Оставить заявку
              </ButtonLink>
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm text-muted transition-[color,border-color] duration-300 hover:border-line-strong hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Схема проезда: условная карта на CSS, вместо тяжёлого iframe.
              На боевом сайте сюда встраивается карта провайдера. */}
          <Reveal className="relative isolate min-h-[420px] overflow-hidden rounded-3xl border border-line bg-surface">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 grid-lines opacity-70"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(140,197,63,0.12),transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 h-px bg-line-strong"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-[38%] w-px bg-line-strong"
            />

            <div className="absolute top-1/2 left-[38%] -translate-x-1/2 -translate-y-1/2">
              <span className="relative grid size-4 place-items-center">
                <span className="absolute size-4 animate-ping rounded-full bg-accent/40" />
                <span className="size-2.5 rounded-full bg-accent" />
              </span>
            </div>

            <div className="absolute right-6 bottom-6 left-6 rounded-2xl border border-line bg-void/80 p-5 backdrop-blur-md">
              <p className="eyebrow mb-2">Как добраться</p>
              <p className="text-[14px] leading-relaxed text-muted">
                7 минут пешком от метро «Автозаводская», въезд со двора, парковка
                для клиентов у ворот сервиса.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
