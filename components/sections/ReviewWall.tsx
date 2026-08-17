"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatReviewDate, type FeedReview } from "@/lib/reviews";
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
 * Фильтр по модели — единственное состояние на странице. Он нужен не для
 * красоты: половина людей приходит сюда с карточки конкретной модели
 * и хочет видеть отзывы про неё.
 *
 * Фото и видео карточка показывает, если они есть в данных. Пока их нет
 * ни в одном отзыве: заказчик собирает контент, разметка его дождётся.
 */
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

      {/* Кладка: три колонки на десктопе, две на планшете, одна на телефоне.
          `break-inside` не даёт карточке разорваться между колонками. */}
      <div className="mt-6 gap-5 [column-fill:balance] sm:columns-2 xl:columns-3">
        {shown.map((review) => (
          <figure
            key={`${review.slug}-${review.name}-${review.date}`}
            className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface"
          >
            {review.photo ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={review.photo.src}
                  alt={review.photo.alt}
                  fill
                  sizes="(max-width: 639px) 92vw, (max-width: 1279px) 45vw, 30vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            {review.video ? (
              <video
                controls
                preload="none"
                poster={review.video.poster}
                playsInline
                className="block w-full"
                style={{ aspectRatio: review.video.ratio }}
              >
                <source src={review.video.src} type="video/mp4" />
              </video>
            ) : null}

            <div className="p-6 lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <span
                  className="flex items-center gap-0.5"
                  aria-label={`Оценка ${review.rating} из 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} viewBox="0 0 14 14" aria-hidden="true" className="size-3.5">
                      <path
                        d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
                        fill={
                          star <= review.rating
                            ? "var(--color-accent)"
                            : "var(--color-line-strong)"
                        }
                      />
                    </svg>
                  ))}
                </span>
                <time
                  dateTime={review.date}
                  className="readout text-[11px] whitespace-nowrap text-faint"
                >
                  {formatReviewDate(review.date)}
                </time>
              </div>

              <blockquote className="mt-5 text-[14px] leading-relaxed text-muted">
                {review.text}
              </blockquote>

              <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-ink">
                  {review.name}
                </span>
                <Link
                  href={`/product/${review.slug}`}
                  className="readout text-[11px] text-faint transition-colors duration-300 hover:text-accent"
                >
                  {review.product}
                </Link>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </>
  );
}
