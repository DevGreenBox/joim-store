"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { GOALS, track } from "@/lib/analytics";
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
    track(GOALS.addToCart, { slug });
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

  /**
   * Подписанная кнопка, а не кружок с плюсом. Раньше единственным способом
   * купить с витрины был безымянный «+» 40 px, а всё подтверждение — морфинг
   * иконки внутри него. Ни того, ни другого человек на телефоне не читает.
   */
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleAdd}
      aria-live="polite"
      className={`relative z-10 shrink-0 ${added ? "border-accent/45 text-accent" : ""} ${className}`}
    >
      {added ? "Добавлено" : "В корзину"}
    </Button>
  );
}
