import type { Metadata } from "next";
import Link from "next/link";

import { LeadForm } from "@/components/sections/LeadForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewCard } from "@/components/ui/ReviewCard";
import { getProducts } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { getReviews, getReviewsSummary } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Отзывы",
  description:
    "Отзывы покупателей о пусковых устройствах JOIM Easy Start ES-19 и ES-29 и автопылесосе PVC-1: оценки, распределение баллов и тексты без правок.",
  alternates: { canonical: "/reviews" },
};

const RATINGS = [5, 4, 3, 2, 1];

export default function ReviewsPage() {
  const products = getProducts();
  const summary = getReviewsSummary();

  return (
    <div className="pt-12 lg:pt-16">
      <Container size="wide">
        <Breadcrumbs items={[{ label: "Отзывы" }]} />
        <div className="mt-7 max-w-3xl">
          <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance">
            Что говорят о наших устройствах
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            Отзывы покупателей наших устройств. Тексты публикуем дословно,
            вместе с опечатками.
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-14">
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          <Reveal className="bg-surface p-6 lg:p-8">
            <dt className="num font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em]">
              {summary.average.toFixed(1).replace(".", ",")}
            </dt>
            <dd className="mt-3 text-[13px] leading-snug text-muted">
              средний балл по линейке
            </dd>
          </Reveal>
          <Reveal delay={70} className="bg-surface p-6 lg:p-8">
            <dt className="num font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em]">
              {summary.total.toLocaleString("ru-RU")}
            </dt>
            <dd className="mt-3 text-[13px] leading-snug text-muted">
              {plural(summary.total, "оценка", "оценки", "оценок")} покупателей
            </dd>
          </Reveal>
          <Reveal delay={140} className="bg-surface p-6 lg:p-8">
            <dt className="num font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none font-semibold tracking-[-0.03em]">
              {summary.published}
            </dt>
            <dd className="mt-3 text-[13px] leading-snug text-muted">
              {plural(summary.published, "отзыв", "отзыва", "отзывов")}{" "}
              на этой странице
            </dd>
          </Reveal>
        </dl>
      </Container>

      {products.map((product) => {
        const data = getReviews(product.slug);
        if (!data) return null;

        return (
          <Container
            key={product.slug}
            size="wide"
            className="mt-14 lg:mt-28"
            id={product.slug}
          >
            <div className="flex flex-wrap items-center gap-6 border-b border-line pb-8">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-line">
                <ProductImage
                  product={product}
                  sizes="64px"
                  className="size-full"
                />
              </div>

              <div className="min-w-[180px] flex-1">
                <h2 className="font-display text-xl leading-snug font-semibold tracking-[-0.02em]">
                  <Link
                    href={`/product/${product.slug}`}
                    className="transition-colors duration-300 hover:text-accent"
                  >
                    {product.name}
                  </Link>
                </h2>
                <p className="readout mt-1.5 text-[12px] text-faint">
                  {data.average.toFixed(1).replace(".", ",")} ·{" "}
                  {data.total.toLocaleString("ru-RU")}{" "}
                  {plural(data.total, "оценка", "оценки", "оценок")}
                </p>
              </div>

              {/* Распределение баллов — по нему видно, что пятёрки не нарисованы */}
              <dl className="w-full max-w-xs space-y-1.5 sm:w-auto sm:min-w-[240px]">
                {RATINGS.map((rating) => {
                  const count = data.distribution[String(rating)] ?? 0;
                  const share = data.total ? (count / data.total) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <dt className="readout w-3 text-[11px] text-faint">
                        {rating}
                      </dt>
                      <dd className="flex flex-1 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="h-1 flex-1 overflow-hidden rounded-full bg-line"
                        >
                          <span
                            className="block h-full rounded-full bg-accent"
                            style={{ width: `${Math.max(share, share > 0 ? 2 : 0)}%` }}
                          />
                        </span>
                        <span className="readout w-10 text-right text-[11px] text-faint">
                          {count.toLocaleString("ru-RU")}
                        </span>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.items.map((review, index) => (
                <Reveal
                  as="li"
                  key={`${review.name}-${review.date}-${index}`}
                  delay={(index % 3) * 80}
                  y={16}
                  className="h-full"
                >
                  <ReviewCard review={review} />
                </Reveal>
              ))}
            </ul>
          </Container>
        );
      })}

      <div className="mt-16 lg:mt-32">
        <LeadForm />
      </div>
    </div>
  );
}
