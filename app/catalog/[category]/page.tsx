import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductHighlights } from "@/components/sections/ProductHighlights";
import { CatalogUsp } from "@/components/sections/CatalogPromo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import catalogContent from "@/content/pages/catalog.json";
import { getCategories, getCategory, queryProducts } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";
import { site } from "@/lib/site";
import type { Highlight, Product } from "@/lib/types";

type Params = Promise<{ category: string }>;

const content = catalogContent.category;
// JSON приходит как string[]; для plural нужны ровно три формы.
const modelForms = content.stats.models as [string, string, string];

export function generateStaticParams() {
  return getCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) return { title: "Категория не найдена" };

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/catalog/${category.slug}` },
    openGraph: {
      type: "website",
      title: `${category.name} · ${site.name}`,
      description: category.description,
      url: `/catalog/${category.slug}`,
    },
  };
}

/**
 * Показания категории считаются по её товарам: цена — минимальная,
 * балл и число оценок — по всем моделям. Отдельных цифр в контенте нет,
 * поэтому разойтись с карточками они не могут.
 */
function stats(products: Product[]): Highlight[] {
  const reviews = products.reduce((sum, p) => sum + p.reviews, 0);
  const rating = reviews
    ? products.reduce((sum, p) => sum + p.rating * p.reviews, 0) / reviews
    : 0;
  const price = Math.min(...products.map((p) => p.price));

  return [
    {
      value: String(products.length),
      label: plural(products.length, ...modelForms),
    },
    {
      value: formatPrice(price).replace(/\s?₽$/, ""),
      unit: "₽",
      label: content.stats.price,
    },
    {
      value: rating.toFixed(1).replace(".", ","),
      label: content.stats.rating,
    },
    {
      value: reviews.toLocaleString("ru-RU"),
      label: content.stats.reviews,
    },
  ];
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  const products = queryProducts({ category: category.slug });
  if (products.length === 0) notFound();

  // Подбор живёт на главной; здесь на него зовём, а не повторяем его.
  const showPicker = products.length > 1;

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide" className="relative">
        <Breadcrumbs
          items={[
            { label: "Каталог", href: "/catalog" },
            { label: category.name },
          ]}
        />

        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            {category.name}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            {category.description}
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-12 lg:mt-[150px]">
        <ProductHighlights items={stats(products)} columns={4} />
      </Container>

      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-5">
          <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em]">
            {content.gridTitle}
          </h2>
          <p className="num text-[13px] text-muted">
            {products.length}{" "}
            {plural(products.length, "модель", "модели", "моделей")}
          </p>
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {products.map((product, index) => (
            <Reveal
              as="li"
              key={product.slug}
              delay={(index % 2) * 80}
              y={18}
              className="h-full"
            >
              <ProductCard
                product={product}
                eager={index < 2}
                sizes="(min-width: 640px) 45vw, 90vw"
              />
            </Reveal>
          ))}
        </ul>
      </Container>

      {/* Доводы под сеткой: наверху человек ещё выбирает модель,
          внизу ему важно, у кого он её берёт. */}
      <Container size="wide" className="mt-16 lg:mt-[150px]">
        <CatalogUsp />
      </Container>

      {showPicker ? (
        <Container size="wide" className="mt-16 lg:mt-[150px]">
          <Reveal className="flex flex-col gap-8 rounded-2xl border border-line bg-surface p-6 md:flex-row md:items-center md:justify-between lg:p-12">
            <div className="max-w-xl">
              <h2 className="font-display text-[clamp(1.375rem,2.8vw,1.875rem)] leading-tight font-semibold tracking-[-0.02em] text-balance">
                {content.picker.title}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-muted">
                {content.picker.text}
              </p>
            </div>
            <ButtonLink href={content.picker.href} size="lg" arrow>
              {content.picker.cta}
            </ButtonLink>
          </Reveal>
        </Container>
      ) : null}

      <Container size="wide" className="mt-14 lg:mt-[150px]">
        <ButtonLink href="/catalog" variant="outline" arrow>
          {content.allLabel}
        </ButtonLink>
      </Container>
    </div>
  );
}
