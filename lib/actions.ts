"use server";

export type OrderState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string> }
  | { status: "success"; orderId: string };

const NAME_MIN = 2;
const PHONE_DIGITS_MIN = 10;

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Приём заказа. Демонстрационный режим: заявка валидируется и получает номер,
 * но никуда не отправляется и нигде не сохраняется — интеграцию с CRM
 * и платёжным шлюзом подключаем на боевом запуске.
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

  return { status: "success", orderId: `${day}${month}-${tail}` };
}
