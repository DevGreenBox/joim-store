import Link from "next/link";

import { AddToCart } from "@/components/ui/AddToCart";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  /** Первые плитки списка грузим сразу, не дожидаясь скролла. */
  eager?: boolean;
  sizes?: string;
};

export function ProductCard({
  product,
  eager = false,
  sizes = "(min-width: 1280px) 380px, (min-width: 768px) 45vw, 90vw",
}: Props) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  // active: — не дубль hover, а единственный отклик на телефоне: там
  // указателя нет, и без него плитка на нажатие не реагирует вовсе.
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.9)] active:border-line-strong active:duration-200">
      <div className="relative aspect-[5/4] w-full">
        <ProductImage
          product={product}
          sizes={sizes}
          eager={eager}
          className="size-full"
        />

        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {product.badge ? (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] leading-none font-medium tracking-wide text-accent backdrop-blur-sm">
                {product.badge}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="num rounded-full border border-line-strong bg-void/60 px-2.5 py-1 text-[11px] leading-none font-medium text-ink backdrop-blur-sm">
                −{discount}%
              </span>
            ) : null}
          </div>
          {!product.inStock ? (
            <span className="rounded-full border border-line bg-void/60 px-2.5 py-1 text-[11px] leading-none text-faint backdrop-blur-sm">
              Под заказ
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-line p-5">
        <p className="readout text-[11px] leading-none tracking-[0.16em] text-faint uppercase">
          {product.brand}
        </p>

        <h3 className="font-display text-lg leading-snug font-semibold tracking-[-0.01em]">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">
          {product.short}
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
          <div>
            {product.oldPrice ? (
              <p className="num text-[13px] text-faint line-through">
                {formatPrice(product.oldPrice)}
              </p>
            ) : null}
            <p className="num font-display text-xl font-semibold tracking-[-0.01em]">
              {formatPrice(product.price)}
            </p>
          </div>
          <AddToCart slug={product.slug} inStock={product.inStock} />
        </div>
      </div>
    </article>
  );
}
