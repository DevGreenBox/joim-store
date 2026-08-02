"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";

import { ProductArt } from "@/components/ui/ProductArt";
import { artFor } from "@/lib/catalog";
import type { Product } from "@/lib/types";

/**
 * Галерея ракурсов на карточке товара.
 *
 * Кадры не подменяются в одном <img>, а лежат стопкой и переключаются
 * прозрачностью: между ракурсами нет ни моргания, ни ожидания загрузки.
 * Их максимум три и весят они 22–104 КБ, так что стопка дешевле подмены.
 *
 * Переключение: клик по миниатюре, стрелки с клавиатуры, свайп на телефоне.
 */

const SWIPE_MIN = 40;

export function ProductGallery({
  product,
  children,
}: {
  product: Product;
  /** Бейджи поверх кадра — рисуются страницей товара. */
  children?: ReactNode;
}) {
  const images = product.images;
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  function go(next: number, focusThumb = false) {
    const clamped = (next + images.length) % images.length;
    setIndex(clamped);
    if (focusThumb) {
      thumbsRef.current?.querySelectorAll("button")[clamped]?.focus();
    }
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1, true);
    }
  }

  return (
    <div>
      <div
        className="group relative isolate overflow-hidden rounded-3xl border border-line bg-surface-2"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const from = touchStart.current;
          touchStart.current = null;
          if (from === null || images.length < 2) return;
          const delta = event.changedTouches[0].clientX - from;
          if (Math.abs(delta) < SWIPE_MIN) return;
          go(delta < 0 ? index + 1 : index - 1);
        }}
      >
        {/* Подложка та же, что в плитках каталога: пятно света и сетка линий */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(58%_52%_at_46%_42%,rgba(140,197,63,0.15),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 grid-lines opacity-40"
        />

        <div className="relative aspect-square w-full">
          {images.length > 0 ? (
            images.map((image, i) => (
              <Image
                key={image.src}
                src={image.src}
                alt={`${product.name} — ${image.caption.toLowerCase()}`}
                fill
                sizes="(min-width: 1024px) 640px, 92vw"
                {...(i === 0 ? { preload: true } : null)}
                aria-hidden={i === index ? undefined : true}
                className="object-contain p-[9%] transition-[opacity,transform] duration-700 ease-out-expo"
                style={{
                  opacity: i === index ? 1 : 0,
                  // Уходящий кадр чуть отступает вглубь — переход читается
                  // как смена ракурса, а не как подмена картинки.
                  transform: i === index ? "none" : "scale(0.97)",
                }}
              />
            ))
          ) : (
            <ProductArt
              art={artFor(product)}
              className="absolute inset-0 size-full p-[11%] text-ink/60"
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-5 top-5 flex flex-wrap gap-2">
          {children}
        </div>

        {images.length > 1 ? (
          <p className="readout pointer-events-none absolute right-5 bottom-5 text-[11px] text-faint">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </p>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div
          ref={thumbsRef}
          role="group"
          aria-label="Ракурсы товара"
          onKeyDown={onKeyDown}
          className="mt-3 grid grid-cols-3 gap-3"
        >
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => go(i)}
              aria-pressed={i === index}
              className={`group/thumb relative overflow-hidden rounded-xl border bg-surface-2 text-left transition-colors duration-300 ease-out-soft ${
                i === index
                  ? "border-accent/50"
                  : "border-line hover:border-line-strong active:border-line-strong"
              }`}
            >
              <span className="relative block aspect-[4/3] w-full">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="140px"
                  className="object-contain p-2.5 transition-transform duration-500 ease-out-expo group-hover/thumb:scale-105 group-active/thumb:scale-95"
                />
              </span>
              {/* Подписи разной длины: одни в строку, другие в две. Полоса
                  фиксированной высоты с центрированием держит нижний край
                  миниатюр на одной линии. */}
              <span
                className={`flex min-h-11 items-center border-t px-3 py-2 text-[11px] leading-tight transition-colors duration-300 ${
                  i === index
                    ? "border-accent/30 text-ink"
                    : "border-line text-faint"
                }`}
              >
                {image.caption}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
