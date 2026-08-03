"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { OrderInvoice } from "@/components/ui/OrderInvoice";
import {
  estimateShipping,
  submitOrder,
  type OrderState,
} from "@/lib/actions";
import { GOALS, track } from "@/lib/analytics";
import type { ShippingQuote } from "@/lib/cdek";
import { useCart } from "@/lib/cart";
import { formatPrice, plural } from "@/lib/format";
import { deliveryOptions, FREE_SHIPPING_FROM } from "@/lib/delivery";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

const fieldClass =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[16px] text-ink sm:text-[15px] " +
  "transition-colors duration-300 outline-none placeholder:text-faint focus:border-line-strong";

function Field({
  label,
  name,
  error,
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[13px] font-medium text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${fieldClass} ${error ? "border-danger/60" : ""}`}
        {...rest}
      />
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm({ products }: { products: Product[] }) {
  const { lines, ready, clear } = useCart();
  const [state, formAction, isPending] = useActionState<OrderState, FormData>(
    submitOrder,
    { status: "idle" },
  );
  const [delivery, setDelivery] = useState<string>("pickup");
  const [city, setCity] = useState("");
  /**
   * Живой расчёт СДЭК вместе с тем набором, для которого он получен.
   * Сбрасывать его при смене города через setState в эффекте нельзя —
   * это лишний каскад перерисовок. Вместо сброса сверяем ключ: не сошёлся,
   * значит ответ уже не про текущий выбор, и показываем фиксированный тариф.
   */
  const [live, setLive] = useState<{ key: string; quote: ShippingQuote } | null>(
    null,
  );
  const [pending, startEstimate] = useTransition();

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
  const deliveryOption =
    deliveryOptions.find((option) => option.id === delivery) ??
    deliveryOptions[0];
  const flatShipping =
    subtotal >= FREE_SHIPPING_FROM || subtotal === 0 ? 0 : deliveryOption.price;

  const itemsField = items
    .map((item) => `${item.product.sku}×${item.qty}`)
    .join(", ");

  const quoteKey = `${delivery}|${city.trim().toLowerCase()}|${itemsField}`;
  const askCdek =
    delivery === "cdek" && city.trim().length >= 2 && flatShipping > 0;
  const fresh =
    live?.key === quoteKey && live.quote.source === "cdek" ? live.quote : null;
  const shipping = fresh ? fresh.price : flatShipping;

  // Спрашиваем СДЭК, когда покупатель дописал город. Полсекунды тишины —
  // чтобы не дёргать сервер на каждой букве.
  useEffect(() => {
    if (!askCdek) return;

    const timer = setTimeout(() => {
      startEstimate(async () => {
        const quote = await estimateShipping(itemsField, delivery, city);
        setLive({ key: `${delivery}|${city.trim().toLowerCase()}|${itemsField}`, quote });
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [askCdek, city, delivery, itemsField]);

  // Заказ принят — корзину очищаем, чтобы возврат на сайт был с чистого листа.
  useEffect(() => {
    if (state.status !== "success") return;
    clear();
    track(GOALS.orderDone, { order: state.orderId, total: state.invoice.total });
  }, [state, clear]);

  // Оформление открыто с непустой корзиной — считаем это шагом воронки.
  useEffect(() => {
    if (ready && items.length > 0) track(GOALS.checkoutOpen);
  }, [ready, items.length]);

  const errors = state.status === "error" ? state.errors : {};

  if (state.status === "success") {
    return (
      <div className="mt-12 rounded-3xl border border-line bg-surface p-6 text-center lg:p-20">
        <span
          aria-hidden="true"
          className="mx-auto grid size-14 place-items-center rounded-full border border-accent/40 bg-accent/10"
        >
          <svg viewBox="0 0 24 24" className="size-6">
            <path
              d="m6 12.5 4 4 8-9"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h2 className="font-display mt-7 text-2xl font-semibold tracking-[-0.02em]">
          Заказ № {state.orderId} принят
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
          Менеджер перезвонит в течение рабочего дня: подтвердит наличие
          и согласует доставку.
        </p>
        <p className="mx-auto mt-4 max-w-lg text-[13px] leading-relaxed text-faint">
          Оплата на сайте пока не подключена — рассчитаетесь при получении
          или по счёту.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/catalog" arrow>
            Вернуться в каталог
          </ButtonLink>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            Распечатать накладную
          </Button>
          <a
            href={`tel:${site.phoneHref}`}
            className="num inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-medium transition-colors duration-300 hover:border-ink/60"
          >
            {site.phone}
          </a>
        </div>

        <OrderInvoice invoice={state.invoice} />
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-line bg-surface p-6 text-center lg:p-20">
        <h2 className="font-display text-xl font-semibold tracking-[-0.01em]">
          Оформлять пока нечего
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          Добавьте товары в корзину — или позвоните, и мы соберём комплект под
          вашу машину сами.
        </p>
        <ButtonLink href="/catalog" className="mt-8" arrow>
          В каталог
        </ButtonLink>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14"
    >
      <input type="hidden" name="itemsCount" value={count} />
      <input type="hidden" name="items" value={itemsField} />

      <div className="space-y-10">
        <fieldset>
          <legend className="eyebrow mb-6">Контакты</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Имя"
              name="name"
              autoComplete="name"
              placeholder="Как к вам обращаться"
              error={errors.name}
              required
            />
            <Field
              label="Телефон"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+7 900 000-00-00"
              error={errors.phone}
              required
            />
            <Field
              label="Почта (необязательно)"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="для чека и накладной"
              error={errors.email}
            />
            <Field
              label="Автомобиль (необязательно)"
              name="car"
              placeholder="Марка, модель, год"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-6">Получение</legend>
          <div className="grid gap-3">
            {deliveryOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition-[border-color,background-color] duration-300 ease-out-soft ${
                  delivery === option.id
                    ? "border-accent/45 bg-accent/[0.06]"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option.id}
                  checked={delivery === option.id}
                  onChange={() => setDelivery(option.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                    delivery === option.id
                      ? "border-accent"
                      : "border-line-strong"
                  }`}
                >
                  <span
                    className="size-2 rounded-full bg-accent transition-transform duration-300 ease-out-expo"
                    style={{
                      transform:
                        delivery === option.id ? "scale(1)" : "scale(0)",
                    }}
                  />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-medium">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-[13px] text-muted">
                    {option.hint}
                  </span>
                </span>
                <span className="num text-[13px] text-muted">
                  {option.price === 0 || subtotal >= FREE_SHIPPING_FROM
                    ? "бесплатно"
                    : formatPrice(option.price)}
                </span>
              </label>
            ))}
          </div>

          {delivery !== "pickup" ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {/* Город отдельным полем: по нему СДЭК считает тариф.
                  Из общей строки адреса его пришлось бы угадывать. */}
              <Field
                label="Город"
                name="city"
                autoComplete="address-level2"
                placeholder="Казань"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                error={errors.city}
              />
              <Field
                label="Улица, дом, квартира"
                name="address"
                autoComplete="street-address"
                placeholder="Тверская, 1, кв. 2"
                error={errors.address}
              />
            </div>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-6">Комментарий</legend>
          <label htmlFor="comment" className="sr-only">
            Комментарий к заказу
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            placeholder="Удобное время звонка, адрес пункта выдачи, пожелания к упаковке"
            className="w-full resize-y rounded-xl border border-line bg-surface p-4 text-[16px] leading-relaxed text-ink sm:text-[15px] transition-colors duration-300 outline-none placeholder:text-faint focus:border-line-strong"
          />
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:p-7">
          <h2 className="font-display text-lg font-semibold tracking-[-0.01em]">
            Ваш заказ
          </h2>

          <ul className="mt-6 space-y-4 border-b border-line pb-6">
            {items.map(({ product, qty }) => (
              <li
                key={product.slug}
                className="flex items-baseline justify-between gap-4 text-[13px]"
              >
                <span className="text-muted">
                  {product.name}
                  {qty > 1 ? (
                    <span className="num text-faint"> × {qty}</span>
                  ) : null}
                </span>
                <span className="num whitespace-nowrap">
                  {formatPrice(product.price * qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 text-[14px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">
                {count} {plural(count, "товар", "товара", "товаров")}
              </dt>
              <dd className="num">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted">
                {deliveryOption.title}
                {fresh && fresh.maxDays > 0 ? (
                  <span className="block text-[12px] text-faint">
                    {fresh.minDays === fresh.maxDays
                      ? `${fresh.maxDays} дн.`
                      : `${fresh.minDays}–${fresh.maxDays} дн.`}{" "}
                    по расчёту СДЭК
                  </span>
                ) : null}
              </dt>
              <dd className="num">
                {pending ? (
                  <span className="text-faint">считаем…</span>
                ) : shipping === 0 ? (
                  <span className="text-accent">бесплатно</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
            <p className="text-[13px] text-muted">К оплате</p>
            <p className="num font-display text-2xl font-semibold tracking-[-0.02em]">
              {formatPrice(subtotal + shipping)}
            </p>
          </div>

          <Checkbox name="consent" className="mt-6">
            Согласен на{" "}
            <Link
              href="/privacy"
              className="text-ink underline underline-offset-2 transition-opacity duration-300 hover:opacity-70"
            >
              обработку персональных данных
            </Link>{" "}
            и принимаю{" "}
            <Link
              href="/offer"
              className="text-ink underline underline-offset-2 transition-opacity duration-300 hover:opacity-70"
            >
              условия продажи
            </Link>
          </Checkbox>
          {errors.consent ? (
            <p className="mt-2 text-[12px] text-danger">{errors.consent}</p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={isPending}
          >
            {isPending ? "Отправляем…" : "Подтвердить заказ"}
          </Button>

          {errors.form ? (
            <p className="mt-3 text-center text-[12px] text-danger">
              {errors.form}
            </p>
          ) : null}

          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            Демонстрационный режим: заявка не сохраняется и не оплачивается.
          </p>
        </div>
      </aside>
    </form>
  );
}
