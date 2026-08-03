"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { GOALS, track } from "@/lib/analytics";
import { useCart } from "@/lib/cart";

export function ProductBuy({
  slug,
  inStock,
}: {
  slug: string;
  inStock: boolean;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleAdd() {
    add(slug, qty);
    track(GOALS.addToCart, { slug, qty });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 3000);
  }

  if (!inStock) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="lg" disabled>
          Нет в наличии
        </Button>
        <p className="text-[13px] text-muted">
          Привезём под заказ за 7–14 дней — напишите нам.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-13 shrink-0 items-center rounded-full border border-line-strong">
        <button
          type="button"
          onClick={() => setQty((value) => Math.max(1, value - 1))}
          aria-label="Уменьшить количество"
          disabled={qty <= 1}
          className="grid size-12 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-ink disabled:opacity-30"
        >
          <span className="block h-px w-3.5 bg-current" />
        </button>
        <span
          aria-live="polite"
          className="num w-8 text-center text-[15px] font-medium"
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((value) => Math.min(20, value + 1))}
          aria-label="Увеличить количество"
          disabled={qty >= 20}
          className="grid size-12 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-ink disabled:opacity-30"
        >
          <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5">
            <path
              d="M7 1.5v11M1.5 7h11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* На телефоне кнопка добирает остаток строки: счётчик и кнопка
          встают вровень с краями карточки. С sm ширина снова
          фиксированная — тянуть кнопку через всю колонку незачем. */}
      <Button
        size="lg"
        onClick={handleAdd}
        className="flex-1 sm:flex-none sm:min-w-[190px]"
      >
        {added ? "Добавлено" : "В корзину"}
      </Button>

      {/* Смена подписи на кнопке экранным читалкам не слышна — говорим отдельно */}
      <p role="status" className="sr-only">
        {added ? `В корзине ${qty} шт.` : ""}
      </p>

      {/* На телефоне ссылка занимала пустую полосу в 44 px под кнопкой,
          пока её не о чем было показывать: строка складывается по высоте
          и разворачивается вместе с проявлением. С sm она снова обычное
          звено строки — обёртки исчезают через `contents`.

          Пока ссылка не проявилась — она inert: невидимое, но фокусируемое
          звено ломает обход с клавиатуры. */}
      <div
        className="grid w-full transition-[grid-template-rows] duration-500 ease-out-expo sm:contents"
        style={{ gridTemplateRows: added ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden sm:contents">
          <Link
            href="/cart"
            inert={!added}
            className="inline-flex min-h-11 items-center gap-2 text-[13px] text-accent transition-opacity duration-500 lg:min-h-0"
            style={{ opacity: added ? 1 : 0 }}
          >
            Перейти в корзину
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
              <path
                d="M2 8h11M9 4l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
