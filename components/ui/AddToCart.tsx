"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart";

type Props = {
  slug: string;
  inStock: boolean;
  /** icon — компактная кнопка в карточке, full — кнопка на странице товара. */
  variant?: "icon" | "full";
  className?: string;
};

export function AddToCart({
  slug,
  inStock,
  variant = "icon",
  className = "",
}: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleAdd() {
    add(slug);
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  if (!inStock) {
    return variant === "full" ? (
      <Button variant="outline" size="lg" disabled className={className}>
        Нет в наличии
      </Button>
    ) : null;
  }

  if (variant === "full") {
    return (
      <Button
        size="lg"
        onClick={handleAdd}
        className={className}
        aria-live="polite"
      >
        {added ? "Добавлено в корзину" : "В корзину"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      aria-label={added ? "Товар добавлен в корзину" : "Добавить в корзину"}
      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-[background-color,border-color,transform] duration-300 ease-out-soft hover:border-ink/60 hover:bg-white/[0.06] active:scale-90 ${className}`}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px]">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-200"
          style={{ opacity: added ? 0 : 1 }}
        >
          <path d="M10 4.5v11M4.5 10h11" />
        </g>
        <path
          d="m4.5 10.5 3.5 3.5 7.5-8"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-200"
          style={{ opacity: added ? 1 : 0 }}
        />
      </svg>
    </button>
  );
}
