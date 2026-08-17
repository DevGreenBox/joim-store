import type { Metadata } from "next";
import Link from "next/link";

import { LeadForm } from "@/components/sections/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { StarMark } from "@/components/ui/StarMark";
import guides from "@/content/pages/guides.json";
import { getProducts } from "@/lib/catalog";

/**
 * Экспертный раздел (структура заказчика, п. 4.8): подробные ответы
 * на вопросы, с заделом под новые статьи.
 *
 * Статьи лежат списком в `content/pages/guides.json`. Пока она одна,
 * поэтому раздел показывает её целиком, без промежуточной страницы
 * со списком: оглавление из одного пункта — лишний клик. Появится
 * вторая — список включится сам.
 */

export const metadata: Metadata = {
  title: "Как выбрать пусковое устройство — разбор по характеристикам",
  description:
    "Пусковой ток, ёмкость, мороз, защита от переполюсовки и число запусков: что из характеристик действительно решает, а на что можно не смотреть.",
  alternates: { canonical: "/how-to-choose" },
};

export default function HowToChoosePage() {
  const [article] = guides.articles;
  const products = getProducts();

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide" className="relative">
        <Breadcrumbs items={[{ label: "Как выбрать" }]} />
        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-h1 font-semibold text-balance">
            {guides.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            {guides.lead}
          </p>
          <p className="readout mt-6 text-[11px] tracking-[0.12em] text-faint uppercase">
            Чтение · {article.readTime}
          </p>
        </div>
      </Container>

      {/* Витрина ответов. Раньше на этом месте была узкая колонка-оглавление
          со ссылками 13 px — она читалась как служебная навигация, а не как
          то, за чем сюда идут. Каждый ответ вынесен плиткой с первой фразой:
          человек видит, о чём разбор, ещё до чтения. */}
      <Container size="wide" className="mt-12 lg:mt-[75px]">
        <h2 className="eyebrow mb-6">Ответы по порядку</h2>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {article.sections.map((section, index) => (
            <Reveal as="li" key={section.title} delay={(index % 3) * 70}>
              <Link
                href={`#p${index + 1}`}
                className="group flex h-full flex-col bg-surface p-6 transition-colors duration-300 hover:bg-surface-2 lg:p-7"
              >
                <span className="readout text-[11px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display mt-3 text-[15px] leading-snug font-semibold tracking-[-0.01em] transition-colors duration-300 group-hover:text-accent">
                  {section.title}
                </span>
                <span className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
                  {section.text}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="max-w-2xl">
            {article.sections.map((section, index) => (
              <Reveal
                as="section"
                key={section.title}
                id={`p${index + 1}`}
                delay={index * 40}
                className="scroll-mt-28 border-t border-line pt-8 first:border-0 first:pt-0 [&+&]:mt-10"
              >
                <p className="readout text-[11px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display mt-3 text-h3 font-semibold">
                  {section.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  {section.text}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Чек-лист сбоку и липкий: его открывают перед покупкой,
              а не дочитав разбор до конца. */}
          <Reveal className="relative isolate h-max overflow-hidden rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:p-8">
            <StarMark className="pointer-events-none absolute -right-[10%] -bottom-[30%] -z-10 aspect-square w-[52%] rotate-[-14deg] text-accent/[0.07]" />
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">
              Короткий список для проверки
            </h2>
            <ul className="mt-6 space-y-3">
              {article.checklist.map((item) => (
                <li key={item} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                  <StarMark className="mt-1 size-3 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <Reveal>
          <span aria-hidden="true" className="gauge accent-rule mb-6" />
          <h2 className="font-display text-h2 font-semibold">
            Все три модели
          </h2>
        </Reveal>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <Reveal as="li" key={product.slug} delay={index * 70}>
              <ProductCard product={product} eager={index < 3} />
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-10">
          <ButtonLink href="/catalog" variant="outline" arrow>
            Весь каталог
          </ButtonLink>
        </Reveal>
      </Container>

      <div className="lg:mt-[75px]">
        <LeadForm />
      </div>
    </div>
  );
}
