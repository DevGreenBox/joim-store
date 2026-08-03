"use client";

import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/lib/cart";
import { formatPrice, plural } from "@/lib/format";
import { FREE_SHIPPING_FROM, getDeliveryOption } from "@/lib/delivery";
import type { Product } from "@/lib/types";

export function CartView({ products }: { products: Product[] }) {
  const { lines, ready, setQty, remove } = useCart();

  const items = lines
    .map((line) => ({
      product: products.find((p) => p.slug === line.slug),
      qty: line.qty,
    }))
    .filter((item): item is { product: Product; qty: number } =>
      Boolean(item.product),
    );

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const shipping =
    subtotal >= FREE_SHIPPING_FROM ? 0 : getDeliveryOption("courier").price;
  const toFreeShipping = Math.max(0, FREE_SHIPPING_FROM - subtotal);

  if (!ready) {
    return (
      <div
        aria-hidden="true"
        className="mt-12 h-64 animate-pulse rounded-2xl border border-line bg-surface"
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-line bg-surface p-6 text-center lg:p-20">
        <h2 className="font-display text-xl font-semibold tracking-[-0.01em]">
          В корзине пока пусто
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          Подберём модель под ваш мотор: позвоните или напишите.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/catalog" arrow>
            В каталог
          </ButtonLink>
          <ButtonLink href="/warranty" variant="outline">
            Гарантия и возврат
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <ul className="divide-y divide-line border-y border-line">
        {items.map(({ product, qty }) => (
          <li
            key={product.slug}
            className="group flex flex-wrap items-start gap-5 py-6 sm:flex-nowrap"
          >
            <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-line sm:size-28">
              <ProductImage
                product={product}
                sizes="112px"
                className="size-full"
              />
            </div>

            <div className="min-w-[180px] flex-1">
              <p className="readout text-[11px] leading-none tracking-[0.16em] text-faint uppercase">
                {product.brand}
              </p>
              <h2 className="font-display mt-2 text-base leading-snug font-semibold tracking-[-0.01em]">
                <Link
                  href={`/product/${product.slug}`}
                  className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-accent lg:min-h-0"
                >
                  {product.name}
                </Link>
              </h2>
              <p className="readout mt-1.5 text-[12px] text-faint">
                Артикул {product.sku}
              </p>

              <button
                type="button"
                onClick={() => remove(product.slug)}
                className="mt-2 inline-flex min-h-11 items-center text-[12px] text-faint transition-colors duration-300 hover:text-danger lg:mt-3 lg:min-h-0"
              >
                Удалить
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex h-10 items-center rounded-full border border-line">
                <button
                  type="button"
                  onClick={() => setQty(product.slug, qty - 1)}
                  aria-label={`Уменьшить количество: ${product.name}`}
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-ink"
                >
                  <span className="block h-px w-3 bg-current" />
                </button>
                <span className="num w-7 text-center text-sm">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(product.slug, qty + 1)}
                  aria-label={`Увеличить количество: ${product.name}`}
                  className="grid size-10 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-ink"
                >
                  <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
                    <path
                      d="M6 1v10M1 6h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <p className="num font-display w-28 text-right text-base font-semibold">
                {formatPrice(product.price * qty)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:p-7">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">
            Итого
          </h2>

          <dl className="mt-6 space-y-3 text-[14px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">
                {count} {plural(count, "товар", "товара", "товаров")}
              </dt>
              <dd className="num">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">Доставка</dt>
              <dd className="num">
                {shipping === 0 ? (
                  <span className="text-accent">бесплатно</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
          </dl>

          {toFreeShipping > 0 ? (
            <div className="mt-5 rounded-xl border border-line bg-void p-4">
              <p className="text-[12px] leading-relaxed text-muted">
                До бесплатной доставки —{" "}
                <span className="num text-ink">
                  {formatPrice(toFreeShipping)}
                </span>
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out-expo"
                  style={{
                    width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
            <p className="text-[13px] text-muted">К оплате</p>
            <p className="num font-display text-2xl font-semibold tracking-[-0.02em]">
              {formatPrice(subtotal + shipping)}
            </p>
          </div>

          <ButtonLink href="/checkout" size="lg" className="mt-7 w-full" arrow>
            Оформить заказ
          </ButtonLink>

          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            Менеджер подтвердит заказ по телефону перед отправкой.
          </p>
        </div>
      </aside>
    </div>
  );
}
