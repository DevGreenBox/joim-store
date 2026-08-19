"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ReviewOpen } from "@/components/ui/ReviewOpen";

import { formatReviewDate, reviewMedia, type FeedReview } from "@/lib/reviews";
import { plural } from "@/lib/format";

/**
 * Стена отзывов: сплошной поток карточек в несколько колонок.
 *
 * Кладка сделана на `columns`, а не на сетке: карточки разной высоты
 * укладываются без дыр и без скрипта, который меряет и раскладывает.
 * Плата за это — порядок чтения идёт вниз по колонке, а не слева
 * направо. Для ленты отзывов это норма: её просматривают, а не читают
 * подряд, и ровно так же работают все стены такого рода.
 *
 * Колонок четыре на широком экране, а не три, и шов между карточками
 * узкий: у доски, на которую смотрят, а не читают, плотность и есть
 * главное свойство. Три широкие колонки превращали ленту в три столбца
 * текста.
 *
 * Живой её делает не украшение, а разный вес карточек. Он берётся
 * из самого содержимого, а не назначается:
 *
 *   — есть фото или видео — карточка ведёт кадром;
 *   — отзыв короткий — набирается крупно, как реплика, и занимает
 *     мало места по высоте;
 *   — отзыв длинный — обычный набор.
 *
 * Плюс миниатюра модели в подписи каждой карточки: 25 текстовых
 * карточек без единого изображения читаются серой простынёй, а кадр
 * устройства в углу даёт ленте ритм и цвет. Это фото товара из нашей же
 * съёмки, а не подделка под фото покупателя.
 *
 * Фото и видео от покупателей карточка покажет, как только они появятся
 * в данных: разметка рассчитана на них, а `content/catalog/reviews.json`
 * пополняется без участия разработчика.
 */

/** Короче этого — реплика, набираем крупно. */
const SHORT = 150;

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`Оценка ${rating} из 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 14 14"
          aria-hidden="true"
          className="size-3.5"
        >
          <path
            d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
            fill={
              star <= rating
                ? "var(--color-accent)"
                : "var(--color-line-strong)"
            }
          />
        </svg>
      ))}
    </span>
  );
}

function Chip({
  slug,
  product,
  cover,
}: Pick<FeedReview, "slug" | "product" | "cover">) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group/chip relative z-10 inline-flex min-h-11 items-center gap-2.5 text-[12px] text-faint transition-colors duration-300 hover:text-accent"
    >
      {cover?.src ? (
        <span className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-line bg-void">
          <Image
            src={cover.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="32px"
            className="object-contain p-1"
          />
        </span>
      ) : null}
      <span className="readout">{product}</span>
    </Link>
  );
}

export function ReviewWall({
  reviews,
  filters,
}: {
  reviews: FeedReview[];
  filters: { slug: string; label: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? reviews.filter((r) => r.slug === active) : reviews;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={`inline-flex min-h-11 items-center rounded-full border px-5 text-[13px] transition-colors duration-300 ${
            active === null
              ? "border-accent/60 bg-accent/10 text-accent"
              : "border-line text-muted hover:border-line-strong hover:text-ink"
          }`}
        >
          Все отзывы
          <span className="readout ml-2 text-[11px] text-faint">
            {reviews.length}
          </span>
        </button>

        {filters.map((filter) => {
          const count = reviews.filter((r) => r.slug === filter.slug).length;
          if (count === 0) return null;
          const on = active === filter.slug;
          return (
            <button
              key={filter.slug}
              type="button"
              onClick={() => setActive(on ? null : filter.slug)}
              aria-pressed={on}
              className={`inline-flex min-h-11 items-center rounded-full border px-5 text-[13px] transition-colors duration-300 ${
                on
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {filter.label}
              <span className="readout ml-2 text-[11px] text-faint">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="readout mt-6 text-[11px] tracking-[0.1em] text-faint uppercase">
        {shown.length} {plural(shown.length, "отзыв", "отзыва", "отзывов")}
      </p>

      {/* Кладка: одна колонка на телефоне, две на планшете, три
          на ноутбуке, четыре на широком экране. `break-inside` не даёт
          карточке разорваться между колонками. */}
      <div className="mt-6 gap-4 [column-fill:balance] sm:columns-2 lg:columns-3 xl:columns-4">
        {shown.map((review) => {
          const shots = reviewMedia(review);
          const cover = shots[0];
          const brief = !cover && review.text.length <= SHORT;

          return (
            <ReviewOpen
              key={`${review.slug}-${review.name}-${review.date}`}
              review={review}
              product={review.product}
              slug={review.slug}
              className="mb-4 break-inside-avoid"
            >
              <figure
                className={`overflow-hidden rounded-2xl border transition-colors duration-500 ${
                  brief
                    ? "border-line-strong bg-surface-2 hover:border-accent/40"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                {cover ? (
                  // В ленте — один кадр и счётчик остальных: открывать
                  // галерею прямо в кладке некуда, а видео тут не играет,
                  // иначе на плитке две цели под курсором и человек,
                  // метивший в отзыв, попадает в проигрыватель.
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={cover.type === "photo" ? cover.src : cover.poster}
                      alt={cover.type === "photo" ? cover.alt : ""}
                      aria-hidden={cover.type === "video" ? "true" : undefined}
                      fill
                      sizes="(max-width: 639px) 92vw, (max-width: 1023px) 45vw, (max-width: 1279px) 30vw, 23vw"
                      className="object-cover"
                    />

                    {cover.type === "video" ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 grid place-items-center"
                      >
                        <span className="grid size-14 place-items-center rounded-full border border-line-strong bg-void/70 text-ink backdrop-blur-sm">
                          <svg viewBox="0 0 24 24" className="ml-0.5 size-5">
                            <path d="M8 5v14l11-7z" fill="currentColor" />
                          </svg>
                        </span>
                      </span>
                    ) : null}

                    {shots.length > 1 ? (
                      <span className="readout absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-void/75 px-3 py-1.5 text-[11px] leading-none backdrop-blur-sm">
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          className="size-3"
                        >
                          <path
                            d="M2 4h9v9H2zM5 1h9v9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                          />
                        </svg>
                        {shots.length}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className={brief ? "p-6" : "p-5 lg:p-6"}>
                  <div className="flex items-center justify-between gap-4">
                    <Stars rating={review.rating} />
                    <time
                      dateTime={review.date}
                      className="readout text-[11px] whitespace-nowrap text-faint"
                    >
                      {formatReviewDate(review.date)}
                    </time>
                  </div>

                  <blockquote
                    className={
                      brief
                        ? "font-display mt-4 text-[19px] leading-snug font-medium tracking-[-0.01em] text-ink"
                        : "mt-4 text-[14px] leading-relaxed text-muted"
                    }
                  >
                    {review.text}
                  </blockquote>

                  <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-1">
                    <span className="text-[13px] font-medium text-ink">
                      {review.name}
                    </span>
                    <Chip
                      slug={review.slug}
                      product={review.product}
                      cover={review.cover}
                    />
                  </figcaption>
                </div>
              </figure>
            </ReviewOpen>
          );
        })}
      </div>
    </>
  );
}
