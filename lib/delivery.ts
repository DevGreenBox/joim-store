import delivery from "@/content/pages/delivery.json";

/**
 * Тарифы доставки одним источником: их читают и страница оформления,
 * и сервер при приёме заказа. Раньше цифры были зашиты в компонент,
 * и сервер не мог проверить сумму — верил тому, что прислал браузер.
 */

export type DeliveryOption = {
  id: string;
  title: string;
  hint: string;
  price: number;
};

export const deliveryOptions = delivery.rates.options as DeliveryOption[];

/** Порог бесплатной доставки, ₽ */
export const FREE_SHIPPING_FROM = delivery.rates.freeFrom;

export function getDeliveryOption(id: string): DeliveryOption {
  return deliveryOptions.find((option) => option.id === id) ?? deliveryOptions[0];
}

/** Стоимость доставки по сумме заказа и выбранному способу. */
export function shippingFor(subtotal: number, deliveryId: string): number {
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_FROM) return 0;
  return getDeliveryOption(deliveryId).price;
}
