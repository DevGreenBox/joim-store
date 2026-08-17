import type { Metadata } from "next";

import { CatalogFilters } from "@/components/sections/CatalogFilters";
import { CatalogBanner, CatalogUsp } from "@/components/sections/CatalogPromo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
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

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide" className="relative">
        <Breadcrumbs
          items={[
            { label: "Каталог", href: category ? "/catalog" : undefined },
            ...(category ? [{ label: category.name }] : []),
          ]}
        />

        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-h1 font-semibold text-balance">
            {category ? category.name : catalogContent.all.title}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            {category ? category.description : catalogContent.all.text}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-12 lg:mt-[75px]">
        <CatalogFilters query={query} />

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-5">
          <h2 className="font-display text-h3 font-semibold">
            {category ? category.name : "Все модели"}
          </h2>
          <p className="num text-[13px] text-muted">
            {products.length}{" "}
            {plural(products.length, "товар", "товара", "товаров")}
            {query.q ? (
              <span className="text-faint"> по запросу «{query.q}»</span>
            ) : null}
          </p>
        </div>

        {products.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 45vw, 90vw"
                />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="mt-12 rounded-2xl border border-line bg-surface p-6 text-center lg:p-16">
            <p className="font-display text-h3 font-semibold">
              Ничего не нашлось
            </p>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
              {query.q
                ? `По запросу «${query.q}» совпадений нет. В линейке три устройства — откройте весь каталог.`
                : "Попробуйте снять отбор — в линейке всего три устройства, они наверняка рядом."}
            </p>
            <ButtonLink href="/catalog" variant="outline" className="mt-8">
              Весь каталог
            </ButtonLink>
          </div>
        )}
      </Container>

      {/* Полоса доверия — после товаров. Наверху она отодвигала первую
          карточку на 1 100 px от начала страницы: человек шёл в каталог
          за прибором, а получал четыре обещания. */}
      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <CatalogUsp />
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <CatalogBanner />
      </Container>
    </div>
  );
}
