import type { Metadata } from "next";

import { LeadForm } from "@/components/sections/LeadForm";
import { ReviewWall } from "@/components/sections/ReviewWall";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { PageMark } from "@/components/ui/PageMark";
import { Reveal } from "@/components/ui/Reveal";
import { StarMark } from "@/components/ui/StarMark";
import { getProducts } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { getReviewFeed, getReviewsSummary } from "@/lib/reviews";
import { site } from "@/lib/site";

/**
 * Отзывы стеной (структура заказчика, п. 3 и 4.3): лента в духе Pinterest
 * вместо разбивки по моделям.
 *
 * Разбивка по моделям с распределением баллов отсюда убрана. Она держалась
 * на сводных оценках маркетплейсов, а заказчик просил площадки
 * не упоминать и показывать только 5,0.
 */

export const metadata: Metadata = {
  title: "Отзывы",
  description:
    "Отзывы владельцев пусковых устройств JOIM Easy Start и автопылесоса PVC-1. Тексты публикуем дословно, вместе с опечатками.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  const products = getProducts();
  const summary = getReviewsSummary();

  const names = Object.fromEntries(
    products.map((product) => [product.slug, product.name]),
  );
  const feed = getReviewFeed(names);
  const filters = products.map((product) => ({
    slug: product.slug,
    label: product.name.replace(/^JOIM\s*/, ""),
  }));

  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide" className="relative">
        <Breadcrumbs items={[{ label: "Отзывы" }]} />
        <PageMark />

        <div className="relative mt-7 max-w-3xl">
          <span aria-hidden="true" className="accent-rule mb-6" />
          <h1 className="font-display text-h1 font-semibold text-balance">
            Что говорят о наших устройствах
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
            Тексты публикуем дословно, вместе с опечатками и восклицательными
            знаками. Ничего не переписываем и не сокращаем.
          </p>
        </div>
      </Container>

      <Container size="wide" className="mt-12 lg:mt-[75px]">
        <Reveal className="relative isolate flex flex-wrap items-center gap-x-12 gap-y-6 overflow-hidden rounded-2xl border border-line bg-surface p-8 lg:p-10">
          <StarMark className="pointer-events-none absolute -right-[6%] -bottom-[40%] -z-10 aspect-square w-[26%] rotate-[-14deg] text-accent/[0.07]" />

          <div>
            <p className="num font-display text-fig-lg font-semibold">
              {summary.average.toFixed(1).replace(".", ",")}
            </p>
            <span className="mt-4 flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((star) => (
                <svg key={star} viewBox="0 0 14 14" className="size-4">
                  <path
                    d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
                    fill="var(--color-accent)"
                  />
                </svg>
              ))}
            </span>
          </div>

          <dl className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <dt className="num font-display text-fig font-semibold">
                {feed.length}
              </dt>
              <dd className="mt-3 text-[13px] text-muted">
                {plural(feed.length, "отзыв", "отзыва", "отзывов")} на странице
              </dd>
            </div>
            <div>
              <dt className="num font-display text-fig font-semibold">
                {products.length}
              </dt>
              <dd className="mt-3 text-[13px] text-muted">
                {plural(products.length, "модель", "модели", "моделей")}{" "}
                в линейке
              </dd>
            </div>
            <div>
              <dt className="num font-display text-fig font-semibold">
                12
              </dt>
              <dd className="mt-3 text-[13px] text-muted">
                месяцев гарантии на каждое
              </dd>
            </div>
          </dl>
        </Reveal>
      </Container>

      <Container size="wide" className="mt-12 lg:mt-[75px]">
        <ReviewWall reviews={feed} filters={filters} />
      </Container>

      {/* Свой отзыв присылают в мессенджер: заводить форму с загрузкой
          файлов и модерацией ради нескольких писем в месяц — лишнее. */}
      <Container size="wide" className="mt-14 lg:mt-[150px]">
        <Reveal className="rounded-2xl border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            Пользуетесь нашим устройством?
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            Пришлите отзыв с фото или видео в мессенджер — опубликуем здесь
            вместе с вашим именем и без правок.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {site.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-medium transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                {social.label}
              </a>
            ))}
          </div>
        </Reveal>
      </Container>

      <div className="lg:mt-[75px]">
        <LeadForm />
      </div>
    </div>
  );
}
