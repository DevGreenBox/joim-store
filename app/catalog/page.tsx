import type { Metadata } from "next";
import Link from "next/link";

import {
  CatalogFilters,
  catalogHref,
} from "@/components/sections/CatalogFilters";
import { FilterPanel } from "@/components/sections/FilterPanel";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import catalogContent from "@/content/pages/catalog.json";
import {
  SORT_OPTIONS,
  getCategory,
  queryProducts,
  type CatalogQuery,
} from "@/lib/catalog";
import { plural } from "@/lib/format";
import type { SortKey } from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toQuery(params: SearchParams): CatalogQuery {
  const sort = first(params.sort);
  return {
    category: first(params.category),
    brand: first(params.brand),
    price: first(params.price),
    q: first(params.q),
    sort: SORT_OPTIONS.some((option) => option.id === sort)
      ? (sort as SortKey)
      : undefined,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const query = toQuery(await searchParams);
  const category = query.category ? getCategory(query.category) : undefined;

  return {
    title: category ? category.name : "Каталог автоэлектроники",
    description: category
      ? category.description
      : "Пусковые устройства JOIM Easy Start ES-19 и ES-29 и автомобильный пылесос PVC-1. Собственное производство, гарантия 12 месяцев.",
    alternates: { canonical: category ? `/catalog/${category.slug}` : "/catalog" },
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = toQuery(params);
  const products = queryProducts(query);
  const category = query.category ? getCategory(query.category) : undefined;
  const activeSort = query.sort ?? "popular";

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-32">
      <Container size="wide">
        <Breadcrumbs
          items={[
            { label: "Каталог", href: category ? "/catalog" : undefined },
            ...(category ? [{ label: category.name }] : []),
          ]}
        />

        <div className="mt-7 max-w-3xl">
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {category ? category.name : catalogContent.all.title}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            {category ? category.description : catalogContent.all.text}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-12 lg:mt-16">
        <div className="grid gap-10 lg:grid-cols-[264px_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <FilterPanel total={products.length}>
              <CatalogFilters query={query} />
            </FilterPanel>
          </aside>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <p className="num text-[13px] text-muted">
                {products.length}{" "}
                {plural(products.length, "товар", "товара", "товаров")}
                {query.q ? (
                  <span className="text-faint"> по запросу «{query.q}»</span>
                ) : null}
              </p>

              <ul className="flex flex-wrap items-center gap-1">
                {SORT_OPTIONS.map((option) => (
                  <li key={option.id}>
                    <Link
                      href={catalogHref(query, {
                        sort: option.id === "popular" ? undefined : option.id,
                      })}
                      aria-current={
                        activeSort === option.id ? "true" : undefined
                      }
                      className={`inline-flex min-h-10 items-center rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 lg:min-h-0 ${
                        activeSort === option.id
                          ? "bg-white/[0.07] text-ink"
                          : "text-faint hover:text-ink"
                      }`}
                    >
                      {option.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {products.length > 0 ? (
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product, index) => (
                  <Reveal
                    as="li"
                    key={product.slug}
                    delay={(index % 3) * 80}
                    y={18}
                    className="h-full"
                  >
                    <ProductCard
                      product={product}
                      eager={index < 3}
                      sizes="(min-width: 1280px) 340px, (min-width: 640px) 45vw, 90vw"
                    />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="mt-16 rounded-2xl border border-line bg-surface p-6 text-center lg:p-16">
                <h2 className="font-display text-xl font-semibold tracking-[-0.01em]">
                  Ничего не нашлось
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
                  Попробуйте убрать часть фильтров — в линейке всего три
                  устройства, они наверняка рядом.
                </p>
                <ButtonLink href="/catalog" variant="outline" className="mt-8">
                  Сбросить фильтры
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
