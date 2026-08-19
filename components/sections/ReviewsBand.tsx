import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewOpen } from "@/components/ui/ReviewOpen";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarMark } from "@/components/ui/StarMark";
import home from "@/content/pages/home.json";
import {
  formatReviewDate,
  getAllReviews,
  getReviewsSummary,
} from "@/lib/reviews";
import { plural } from "@/lib/format";

/**
 * Отзывы сразу после первого экрана — социальное доказательство до того,
 * как человек начал выбирать.
 *
 * Балл считается по опубликованным отзывам, а не по сводным оценкам
 * площадок: заказчик просил показывать 5,0 и не упоминать маркетплейсы.
 * Цифра со стороны уводит человека туда, откуда её взяли, а 5,0 по своей
 * ленте — это честный балл, а не подогнанный.
 *
 * Три отзыва берутся по одному от каждой модели: так видно, что хвалят
 * не одну удачную позицию, а линейку.
 */
export function ReviewsBand() {
  const summary = getReviewsSummary();
  const all = getAllReviews();

  // По одному отзыву на модель, в порядке моделей в каталоге отзывов.
  const picks = Object.values(all)
    .map((product) => product.items[0])
    .filter(Boolean)
    .slice(0, 3);

  if (picks.length === 0) return null;

  return (
    <section className="py-16 lg:py-[75px]">
      <Container size="wide">
        <SectionHeading
          title={home.sections.reviews.title}
          text={home.sections.reviews.text}
          action={
            <ButtonLink
              href={home.sections.reviews.cta.href}
              variant="outline"
              arrow
              className="hidden lg:inline-flex"
            >
              {home.sections.reviews.cta.label}
            </ButtonLink>
          }
        />

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-[280px_1fr] lg:gap-6">
          {/* Балл крупно: он и есть главный довод блока */}
          <Reveal className="relative isolate overflow-hidden rounded-2xl border border-line bg-surface p-8 lg:p-9">
            <StarMark className="pointer-events-none absolute -right-[14%] -bottom-[22%] -z-10 aspect-square w-[62%] rotate-[-14deg] text-accent/[0.07]" />

            <p className="num font-display text-fig-lg font-semibold">5,0</p>
            <span className="mt-5 flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((star) => (
                <svg key={star} viewBox="0 0 14 14" className="size-4">
                  <path
                    d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
                    fill="var(--color-accent)"
                  />
                </svg>
              ))}
            </span>
            <p className="mt-5 text-[13px] leading-relaxed text-muted">
              {summary.total}{" "}
              {plural(summary.total, "отзыв", "отзыва", "отзывов")} владельцев
              наших устройств
            </p>
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-3 lg:gap-6">
            {picks.map((review, index) => (
              <Reveal
                as="li"
                key={`${review.name}-${review.date}`}
                delay={index * 80}
                className="flex"
              >
                <ReviewOpen
                  review={review}
                  className="flex w-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-500 hover:border-line-strong lg:p-7"
                >
                  <span className="flex gap-0.5" aria-hidden="true">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <svg key={i} viewBox="0 0 14 14" className="size-3.5">
                        <path
                          d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
                          fill="var(--color-accent)"
                        />
                      </svg>
                    ))}
                  </span>

                  <p className="mt-5 line-clamp-6 text-[14px] leading-relaxed text-muted">
                    {review.text}
                  </p>

                  <p className="readout mt-auto pt-6 text-[11px] text-faint">
                    {review.name} · {formatReviewDate(review.date)}
                  </p>
                </ReviewOpen>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Ссылка на всю ленту дублируется внизу: на телефоне кнопка
            из заголовка уезжает далеко вверх. */}
        <Reveal className="mt-8 lg:hidden">
          <Link
            href={home.sections.reviews.cta.href}
            className="inline-flex min-h-11 items-center gap-2 text-[13px] text-muted transition-colors duration-300 hover:text-ink"
          >
            {home.sections.reviews.cta.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
