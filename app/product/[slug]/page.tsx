import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ModelCompare } from "@/components/sections/ModelCompare";
import { ProductFit } from "@/components/sections/ProductFit";
import { ProductHighlights } from "@/components/sections/ProductHighlights";
import { ProductProtection } from "@/components/sections/ProductProtection";
import { ProductScenarios } from "@/components/sections/ProductScenarios";
import { ProductVideo } from "@/components/sections/ProductVideo";
import { SavingsBand } from "@/components/sections/SavingsBand";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductBuy } from "@/components/ui/ProductBuy";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductGallery } from "@/components/ui/ProductGallery";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { Spin360 } from "@/components/ui/Spin360";
import { StickyBuy } from "@/components/ui/StickyBuy";
import {
  getCategory,
  getProduct,
  getProducts,
  getRelated,
} from "@/lib/catalog";
import productContent from "@/content/pages/product.json";
import { formatPrice, plural } from "@/lib/format";
import { getReviews } from "@/lib/reviews";
import { FREE_SHIPPING_FROM } from "@/lib/delivery";
import { site } from "@/lib/site";

type Params = Promise<{ slug: string }>;

/**
 * Моноширинным набираем только показания — «3300 А», «29 600 мВт·ч».
 * Длинное значение это уже фраза, и в моноширинном она читается тяжело.
 */
function isReadout(value: string): boolean {
  return value.length <= 18;
}

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) return { title: "Товар не найден" };

  return {
    title: `${product.name} — купить`,
    description: product.short,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · ${site.name}`,
      description: product.short,
      url: `/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) notFound();

  const category = getCategory(product.category);
  // Модели одной категории — от дешёвой к дорогой, чтобы таблица читалась
  // одинаково с карточки любой из них.
  const siblings = [product, ...getRelated(product)].sort(
    (a, b) => a.price - b.price,
  );
  // Одна модель в категории — сравнивать не с чем, зовём в остальной каталог.
  const others = getProducts().filter((item) => item.slug !== product.slug);
  const reviews = getReviews(product.slug);
  const { sections, savings } = productContent;
  // Сравнение с эвакуатором уместно там, где альтернатива — эвакуатор.
  // Для пылесоса такой альтернативы нет, и блок не показывается.
  const showSavings = savings.categories.includes(product.category);
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  // Разметка для поисковиков: карточка товара с ценой и наличием.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.short,
    brand: { "@type": "Brand", name: product.brand },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "RUB",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      url: `${site.url}/product/${product.slug}`,
    },
  };

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container size="wide">
        <Breadcrumbs
          items={[
            { label: "Каталог", href: "/catalog" },
            ...(category
              ? [
                  {
                    label: category.name,
                    href: `/catalog/${category.slug}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Изображение */}
          <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
            <ProductGallery product={product}>
              {product.badge ? (
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[11px] leading-none font-medium tracking-wide text-accent backdrop-blur-sm">
                  {product.badge}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="num rounded-full border border-line-strong bg-void/60 px-3 py-1.5 text-[11px] leading-none font-medium backdrop-blur-sm">
                  −{discount}%
                </span>
              ) : null}
            </ProductGallery>

            <ul className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="bg-surface p-5 text-[13px] leading-snug text-muted"
                >
                  {feature}
                </li>
              ))}
            </ul>

            {/* «Что в коробке» держит левую колонку в росте с правой:
                иначе изображение переставало сопровождать характеристики
                на середине их чтения. */}
            <div className="mt-3 rounded-2xl border border-line bg-surface p-6 lg:p-7">
              <h2 className="eyebrow mb-5">В комплекте</h2>
              <ul className="divide-y divide-line">
                {product.included.map((item, index) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="readout w-5 shrink-0 text-[11px] text-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] leading-snug text-muted">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Информация и покупка */}
          <div>
            <p className="readout text-[11px] leading-none tracking-[0.16em] text-faint uppercase">
              {product.brand}
            </p>

            <h1 className="font-display mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
              <span className="num flex items-center gap-1.5">
                <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5">
                  <path
                    d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
                    fill="var(--color-accent)"
                  />
                </svg>
                {product.rating.toFixed(1).replace(".", ",")}
              </span>
              <span className="num">
                {product.reviews}{" "}
                {plural(product.reviews, "отзыв", "отзыва", "отзывов")}
              </span>
              <span className="readout text-faint">Артикул {product.sku}</span>
              <span
                className={`flex items-center gap-2 ${
                  product.inStock ? "text-accent" : "text-faint"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block size-1.5 rounded-full ${
                    product.inStock
                      ? "animate-sheen bg-accent"
                      : "bg-current"
                  }`}
                />
                {product.inStock ? "В наличии" : "Под заказ"}
              </span>
            </div>

            <p className="mt-8 text-[15px] leading-relaxed text-muted">
              {product.description}
            </p>

            {/* Приборная панель до цены: покупатель, который пришёл
                за одним числом, находит его, не читая характеристики. */}
            <div className="mt-8">
              <ProductHighlights items={product.highlights} />
            </div>

            <div className="mt-10 flex items-end gap-4">
              <p className="num font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em]">
                {formatPrice(product.price)}
              </p>
              {product.oldPrice ? (
                <p className="num pb-1 text-[15px] text-faint line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              ) : null}
            </div>

            <div id="buy" className="mt-7">
              <ProductBuy slug={product.slug} inStock={product.inStock} />
            </div>

            <ul className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              <li className="bg-surface p-5">
                <p className="text-[13px] font-medium">Доставка</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Бесплатно по России при заказе от{" "}
                  {formatPrice(FREE_SHIPPING_FROM)}. Самовывоз в день заказа.
                </p>
              </li>
              <li className="bg-surface p-5">
                <p className="text-[13px] font-medium">Гарантия</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  12 месяцев от производителя, брак меняем без экспертизы.{" "}
                  <Link
                    href="/warranty"
                    className="text-accent transition-opacity duration-300 hover:opacity-70"
                  >
                    Условия
                  </Link>
                </p>
              </li>
            </ul>

            {/* Характеристики */}
            <div className="mt-12">
              <h2 className="eyebrow mb-6">Характеристики</h2>
              <dl className="divide-y divide-line border-y border-line">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
                  >
                    <dt className="text-[13px] text-faint">{spec.label}</dt>
                    <dd
                      className={`text-[14px] text-ink ${
                        isReadout(spec.value) ? "readout" : "text-right"
                      }`}
                    >
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Container>

      {/* Ролик идёт перед сценариями: он показывает то же самое движением,
          а плитки ниже разбирают увиденное по пунктам. */}
      {product.video ? (
        <div className="mt-16 lg:mt-[150px]">
          <ProductVideo
            title={product.video.title}
            text={product.video.text}
            video={product.video}
          />
        </div>
      ) : null}

      {product.spin ? (
        <Container size="wide" className="mt-16 lg:mt-[150px]">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em]">
                {product.spin.title}
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
                {product.spin.text}
              </p>
            </div>

            <Spin360
              frames={Array.from(
                { length: product.spin.count },
                (_, i) =>
                  `${product.spin!.frames}/${String(i).padStart(2, "0")}.webp`,
              )}
              poster={product.spin.poster}
              label={product.name}
            />
          </div>
        </Container>
      ) : null}

      <div className="mt-16 lg:mt-[150px]">
        <ProductScenarios
          title={sections.scenarios.title}
          items={product.scenarios}
          productName={product.name}
        />
      </div>

      {product.protections?.length || product.compatibility?.length ? (
        <div className="mt-16 lg:mt-[150px]">
          <ProductProtection
            title={sections.protection.title}
            text={sections.protection.text}
            protections={product.protections ?? []}
            compatibilityTitle={sections.protection.compatibilityTitle}
            compatibility={product.compatibility ?? []}
          />
        </div>
      ) : null}

      {showSavings ? (
        <div className="mt-16 lg:mt-[150px]">
          <SavingsBand
            title={savings.title}
            note={savings.note}
            priceLabel={savings.priceLabel}
            items={savings.items}
            price={product.price}
          />
        </div>
      ) : null}

      {reviews && reviews.items.length > 0 ? (
        <Container size="wide" className="mt-16 lg:mt-[150px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em]">
                {product.rating.toFixed(1).replace(".", ",")} из 5 по{" "}
                {product.reviews}{" "}
                {plural(product.reviews, "отзыву", "отзывам", "отзывам")}
              </h2>
            </div>
            <ButtonLink
              href="/reviews"
              variant="outline"
              size="sm"
              arrow
            >
              Все отзывы
            </ButtonLink>
          </div>

          <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.items.slice(0, 3).map((review, index) => (
              <Reveal
                as="li"
                key={`${review.name}-${review.date}`}
                delay={index * 80}
                y={16}
                className="h-full"
              >
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </ul>
        </Container>
      ) : null}

      {/* Есть с чем сравнивать — сравниваем. Одна плитка «из этой же
          категории» в сетке на три колонки смотрелась сиротой и не отвечала
          на единственный вопрос покупателя: какую из двух брать. */}
      <div className="mt-16 lg:mt-[150px]">
        <ProductFit
          title={sections.fits.title}
          whoLabel={sections.fits.whoLabel}
          skipLabel={sections.fits.skipLabel}
          fits={product.fits}
        />
      </div>

      {siblings.length > 1 ? (
        <div className="mt-16 lg:mt-[150px]">
          <ModelCompare
            products={siblings}
            currentSlug={product.slug}
            title="Чем модели отличаются"
          />
        </div>
      ) : others.length > 0 ? (
        <Container size="wide" className="mt-16 lg:mt-[150px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em]">
              Смотрите также
            </h2>
            <ButtonLink href="/catalog" variant="outline" size="sm" arrow>
              Весь каталог
            </ButtonLink>
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item, index) => (
              <Reveal
                as="li"
                key={item.slug}
                delay={index * 80}
                className="h-full"
              >
                <ProductCard product={item} />
              </Reveal>
            ))}
          </ul>
        </Container>
      ) : null}

      <StickyBuy
        slug={product.slug}
        name={product.name}
        price={product.price}
        inStock={product.inStock}
        anchorId="buy"
      />
    </div>
  );
}
