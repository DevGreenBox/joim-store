"use client";

import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/lib/cart";
import { formatPrice, plural } from "@/lib/format";
import { FREE_SHIPPING_FROM } from "@/lib/delivery";
import { site } from "@/lib/site";
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
  /**
   * Корзина не называет итог с доставкой: способ получения выбирают
   * на оформлении, и до выбора любая цифра расходится с чекаутом.
   * Бесплатный порог пройден — итог точный, и тогда он «К оплате».
   */
  const freeShipping = subtotal >= FREE_SHIPPING_FROM;
  const toFreeShipping = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  /** Чем добрать до бесплатной доставки: самое дешёвое из того, чего нет. */
  const upsell = products
    .filter((product) => !lines.some((line) => line.slug === product.slug))
    .sort((a, b) => a.price - b.price)[0];

  if (!ready) {
    return (
      <div
        aria-hidden="true"
        className="mt-12 h-64 animate-pulse rounded-2xl border border-line bg-surface"
      />
    );
  }

  // В магазине три модели — пустая корзина показывает все три,
  // а не отправляет за ними в каталог.
  if (items.length === 0) {
    return (
      <div className="mt-12">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:p-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.01em]">
            В корзине пока пусто
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
            Вся линейка — три модели. Подберём под ваш мотор, если
            не уверены: {site.phone}.
          </p>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <li key={product.slug}>
              <ProductCard
                product={product}
                eager={index < 3}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 90vw"
              />
            </li>
          ))}
        </ul>
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

            {/* На телефоне строка переносится под картинку: счётчик слева,
                сумма справа, оба по краям карточки. Раньше пара стояла
                слева одним комком, а справа оставалась пустота. */}
            <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-normal">
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
              <dd className={freeShipping ? "num" : "text-[13px] text-faint"}>
                {freeShipping ? (
                  <span className="text-accent">бесплатно</span>
                ) : (
                  "на оформлении"
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

              {upsell ? (
                <Link
                  href={`/product/${upsell.slug}`}
                  className="mt-4 flex min-h-11 items-center justify-between gap-3 border-t border-line pt-3 text-[12px] transition-colors duration-300 hover:text-accent"
                >
                  <span className="text-muted">
                    {/* «Добрать» — только если этот товар действительно
                        закрывает разрыв. Иначе это просто соседняя модель. */}
                    {upsell.price >= toFreeShipping
                      ? `Добрать до бесплатной — ${upsell.name}`
                      : `Берут вместе — ${upsell.name}`}
                  </span>
                  <span className="num whitespace-nowrap text-ink">
                    {formatPrice(upsell.price)}
                  </span>
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
            <p className="text-[13px] text-muted">
              {freeShipping ? "К оплате" : "Товары"}
            </p>
            <p className="num font-display text-2xl font-semibold tracking-[-0.02em]">
              {formatPrice(subtotal)}
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
