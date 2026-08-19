"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { PosterVideo } from "@/components/ui/PosterVideo";
import { formatReviewDate, reviewMedia, type Review } from "@/lib/reviews";

/**
 * Делает карточку отзыва кликабельной и открывает его целиком
 * в мини-карточке поверх страницы.
 *
 * Зачем: в ленте отзыв обрезан — на главной по шести строкам, в стене
 * длинные отзывы занимают полколонки. Открыть целиком было нельзя
 * никак. Плюс фото и видео от покупателей, когда они появятся, нужно
 * где-то показывать в полный размер, а не миниатюрой в кладке.
 *
 * Окно — родной `<dialog>`, а не своя разметка с `role="dialog"`.
 * Браузер сам делает то, что иначе пришлось бы писать руками и потом
 * чинить: запирает фокус внутри, закрывает по Escape, глушит фон
 * от чтения скринридером, рисует затемнение через `::backdrop`.
 *
 * Появление плавное и сделано на CSS в `globals.css` (`.review-modal`):
 * `@starting-style` задаёт состояние до открытия, `allow-discrete`
 * позволяет анимировать само появление в верхнем слое. При включённом
 * «уменьшить движение» смещение из перехода исключается общим правилом,
 * и окно просто проявляется.
 *
 * Кадров у отзыва может быть несколько — до трёх-четырёх. Тогда
 * в окне открывается галерея: крупный кадр и полоса миниатюр под ним.
 * Под ним, а не сбоку: окно шириной 560 px, и боковая полоса съела бы
 * у кадра пятую часть ширины — ровно то, ради чего его и открывают.
 * Снизу же миниатюры одинаково ложатся и на телефоне, и на десктопе,
 * и это тот же порядок, что в галерее товара, — человек его уже видел.
 *
 * Клик по карточке ловит растянутая кнопка поверх содержимого — тот же
 * приём, что у плиток каталога. Ссылка на модель внутри подписи поднята
 * над ней слоем и остаётся отдельной целью: кнопка внутри кнопки —
 * невалидная разметка, а ссылка рядом с кнопкой — нет.
 */
export function ReviewOpen({
  review,
  product,
  slug,
  className = "",
  children,
}: {
  review: Review;
  /** Модель, о которой отзыв. Есть не везде: на карточке товара она и так известна. */
  product?: string;
  slug?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [shot, setShot] = useState(0);
  const ref = useRef<HTMLDialogElement>(null);
  const media = reviewMedia(review);
  const current = media[shot];

  useEffect(() => {
    if (open) ref.current?.showModal();
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      {children}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Открыть отзыв: ${review.name}, оценка ${review.rating} из 5`}
        aria-haspopup="dialog"
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
      />

      {open ? (
        <dialog
          ref={ref}
          onClose={() => setOpen(false)}
          onClick={(event) => {
            // Клик мимо содержимого — по самому окну — закрывает его:
            // так ведёт себя любой оверлей, и это ожидание надо
            // оправдать. Внутренние клики до сюда не доходят.
            if (event.target === ref.current) ref.current?.close();
          }}
          className="review-modal"
        >
          <div className="review-modal__card">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Закрыть"
              className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border border-line-strong bg-void/80 text-ink backdrop-blur-sm transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </button>

            {current ? (
              <div>
                {current.type === "photo" ? (
                  <div className="relative aspect-[4/3] w-full bg-void">
                    <Image
                      key={current.src}
                      src={current.src}
                      alt={current.alt}
                      fill
                      sizes="(max-width: 639px) 92vw, 560px"
                      className="animate-fade object-cover"
                    />
                  </div>
                ) : (
                  <PosterVideo
                    key={current.src}
                    src={current.src}
                    poster={current.poster}
                    ratio={current.ratio}
                  />
                )}

                {media.length > 1 ? (
                  <ul className="flex gap-2 border-b border-line p-3">
                    {media.map((item, index) => {
                      const on = index === shot;
                      return (
                        <li key={item.src}>
                          <button
                            type="button"
                            onClick={() => setShot(index)}
                            aria-current={on}
                            aria-label={`Кадр ${index + 1} из ${media.length}`}
                            className={`relative block size-16 overflow-hidden rounded-lg border transition-colors duration-300 ${
                              on
                                ? "border-accent"
                                : "border-line hover:border-line-strong"
                            }`}
                          >
                            <Image
                              src={
                                item.type === "photo" ? item.src : item.poster
                              }
                              alt=""
                              aria-hidden="true"
                              fill
                              sizes="64px"
                              className={`object-cover transition-opacity duration-300 ${
                                on ? "opacity-100" : "opacity-60"
                              }`}
                            />
                            {item.type === "video" ? (
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 grid place-items-center bg-void/40"
                              >
                                <svg viewBox="0 0 24 24" className="size-4">
                                  <path d="M8 5v14l11-7z" fill="currentColor" />
                                </svg>
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-4">
                <span
                  className="flex items-center gap-0.5"
                  aria-label={`Оценка ${review.rating} из 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      viewBox="0 0 14 14"
                      aria-hidden="true"
                      className="size-4"
                    >
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
                  className="readout text-[12px] text-faint"
                >
                  {formatReviewDate(review.date)}
                </time>
              </div>

              <blockquote className="mt-6 text-[15px] leading-relaxed text-ink">
                {review.text}
              </blockquote>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                <span className="text-[14px] font-medium text-ink">
                  {review.name}
                </span>
                {product && slug ? (
                  <Link
                    href={`/product/${slug}`}
                    className="readout inline-flex min-h-11 items-center text-[12px] text-faint transition-colors duration-300 hover:text-accent"
                  >
                    {product}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
