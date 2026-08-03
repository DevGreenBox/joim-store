"use server";

import { getProducts } from "@/lib/catalog";
import { packOrder, quote, type ShippingQuote } from "@/lib/cdek";
import { getDeliveryOption, shippingFor } from "@/lib/delivery";
import { notifyLead, notifyOrder } from "@/lib/notify";

/** Накладная: то, что печатают вместе с посылкой. */
export type Invoice = {
  orderId: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  delivery: string;
  address: string;
  city: string;
  comment: string;
  lines: { sku: string; name: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
};

export type OrderState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "success"; orderId: string; invoice: Invoice };

const NAME_MIN = 2;
const PHONE_DIGITS_MIN = 10;

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export type LeadState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "success" };

/**
 * Анкета «остались вопросы».
 *
 * Обязательны только имя и телефон: чем длиннее анкета, тем меньше её
 * заполняют, а перезвонить можно и без темы вопроса. Страница, с которой
 * пришли, передаётся скрытым полем — по ней видно, что именно человек
 * читал перед тем, как спросить.
 */
export async function submitLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const errors: Record<string, string> = {};

  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const digits = phone.replace(/\D/g, "");

  if (name.length < NAME_MIN) errors.name = "Напишите, как к вам обращаться";
  if (digits.length < PHONE_DIGITS_MIN) {
    errors.phone = "Телефон нужен, чтобы перезвонить";
  }
  if (!formData.get("consent")) {
    errors.consent = "Без согласия на обработку данных отправить не получится";
  }

  if (Object.keys(errors).length > 0) return { status: "error", errors };

  await notifyLead({
    name,
    phone,
    topic: text(formData, "topic"),
    question: text(formData, "question"),
    page: text(formData, "page"),
  });

  return { status: "success" };
}

/**
 * Разбор строки корзины вида «JOIM-ES19×1, JOIM-PVC1×2».
 * Артикулы сверяются с каталогом: чего там нет, то и не считается.
 */
function parseItems(items: string) {
  const catalog = getProducts();

  return items
    .split(",")
    .map((chunk) => chunk.trim().split("×"))
    .map(([sku, qty]) => ({
      product: catalog.find((item) => item.sku === sku),
      qty: Number(qty),
    }))
    .filter(
      (line): line is { product: NonNullable<typeof line.product>; qty: number } =>
        Boolean(line.product) && Number.isFinite(line.qty) && line.qty > 0,
    );
}

/**
 * Сумма считается на сервере, а не берётся из формы: цифру в скрытом поле
 * подменит кто угодно, а по артикулу цена приходит из каталога.
 */
function subtotalFor(items: string): number {
  return parseItems(items).reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0,
  );
}

/**
 * Стоимость доставки: сначала спрашиваем СДЭК, при неудаче — фиксированный
 * тариф. Бесплатный порог считается до обращения к СДЭК: если заказ его
 * прошёл, запрос не нужен вовсе.
 */
export async function estimateShipping(
  itemsRaw: string,
  deliveryId: string,
  city: string,
): Promise<ShippingQuote> {
  const items = parseItems(itemsRaw);
  const subtotal = items.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0,
  );
  const flat = shippingFor(subtotal, deliveryId);

  const needsCity = deliveryId === "cdek";
  if (!needsCity || flat === 0 || city.trim().length < 2) {
    return { price: flat, minDays: 0, maxDays: 0, source: "fallback" };
  }

  const parcel = packOrder(
    items.map((line) => ({ shipping: line.product.shipping, qty: line.qty })),
  );
  const live = await quote(city.trim(), parcel, false);

  if (!live) {
    return { price: flat, minDays: 0, maxDays: 0, source: "fallback" };
  }

  return { ...live, source: "cdek" };
}

/**
 * Приём заказа: проверка полей, свой расчёт суммы и уведомление продавцу.
 *
 * Оплата не подключена — деньги не списываются, заказ подтверждается
 * менеджером. Уведомление уходит в Telegram, если заданы ключи в окружении;
 * без них заявка пишется в лог сервера, но не теряется.
 */
export async function submitOrder(
  _prev: OrderState,
  formData: FormData,
): Promise<OrderState> {
  const errors: Record<string, string> = {};

  const name = text(formData, "name");
  const phone = text(formData, "phone");
  const email = text(formData, "email");
  const delivery = text(formData, "delivery");
  const address = text(formData, "address");
  const consent = formData.get("consent");
  const itemsCount = Number(text(formData, "itemsCount"));

  if (name.length < NAME_MIN) {
    errors.name = "Напишите, как к вам обращаться";
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < PHONE_DIGITS_MIN) {
    errors.phone = "Телефон нужен, чтобы подтвердить заказ";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Проверьте адрес почты";
  }

  if (delivery !== "pickup" && address.length < 5) {
    errors.address = "Укажите адрес доставки";
  }

  if (!consent) {
    errors.consent = "Без согласия на обработку данных заказ не оформить";
  }

  if (!Number.isFinite(itemsCount) || itemsCount <= 0) {
    errors.form = "Корзина пуста — добавьте товар перед оформлением";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  // Номер заказа: дата + случайный хвост. Читается по телефону вслух.
  const stamp = new Date();
  const day = String(stamp.getDate()).padStart(2, "0");
  const month = String(stamp.getMonth() + 1).padStart(2, "0");
  const tail = String(Math.floor(Math.random() * 9000) + 1000);
  const orderId = `${day}${month}-${tail}`;

  const items = text(formData, "items");
  const city = text(formData, "city");
  const subtotal = subtotalFor(items);
  const ship = await estimateShipping(items, delivery, city);

  // Уведомление ждём: если сорвётся, покупатель хотя бы увидит номер,
  // а заявка останется в логе сервера. Ошибку notifyOrder не бросает.
  await notifyOrder({
    orderId,
    name,
    phone,
    email,
    delivery,
    city,
    address,
    comment: text(formData, "comment"),
    itemsCount,
    total: subtotal + ship.price,
    items,
  });

  // Накладную собираем из тех же данных, что ушли продавцу: расхождения
  // между бланком и уведомлением быть не должно.
  return {
    status: "success",
    orderId,
    invoice: {
      orderId,
      date: stamp.toLocaleDateString("ru-RU"),
      name,
      phone,
      email,
      delivery: getDeliveryOption(delivery).title,
      address: delivery === "pickup" ? "" : address,
      city,
      comment: text(formData, "comment"),
      lines: parseItems(items).map((line) => ({
        sku: line.product.sku,
        name: line.product.name,
        qty: line.qty,
        price: line.product.price,
      })),
      subtotal,
      shipping: ship.price,
      total: subtotal + ship.price,
    },
  };
}
