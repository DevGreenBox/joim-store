/**
 * Расчёт доставки СДЭК по API v2.
 *
 * Ключи — в окружении: `CDEK_ACCOUNT`, `CDEK_SECURE_PASSWORD`, при работе
 * с тестовым контуром ещё `CDEK_API_URL`. Без ключей расчёт не делается
 * и вызывающий код берёт фиксированный тариф из `content/pages/delivery.json`:
 * витрина должна работать и до подключения договора.
 *
 * Что здесь неочевидно:
 *
 * — **токен живёт час, поэтому кэшируется в памяти процесса.** Запрашивать
 *   его на каждый расчёт нельзя: СДЭК считает такие обращения и ограничивает.
 *   Кэш обновляется за минуту до истечения, чтобы не попасть в момент смены.
 *
 * — **посылка одна на весь заказ.** Считаем суммарный вес и берём
 *   наибольшие габариты: у трёх наших товаров разница в размерах небольшая,
 *   и складывать их по объёму точнее не выйдет — коробку всё равно
 *   подбирает склад.
 *
 * — **любая ошибка означает `null`, а не исключение.** Расчёт доставки
 *   не должен мешать оформлению: не ответил СДЭК — показываем
 *   фиксированный тариф и говорим об этом покупателю.
 */

/** Посылка до двери, оплата при получении. */
const TARIFF_DOOR = 137;
/** Склад-склад: до пункта выдачи. */
const TARIFF_PICKUP_POINT = 136;

const TIMEOUT_MS = 5000;
/** Обновляем токен за минуту до конца, чтобы не поймать смену. */
const TOKEN_SAFETY_MS = 60_000;

export type ShippingQuote = {
  price: number;
  minDays: number;
  maxDays: number;
  /** Откуда цифра: из СДЭК или из наших фиксированных тарифов. */
  source: "cdek" | "fallback";
};

export type Parcel = {
  /** Суммарный вес, граммы. */
  weight: number;
  length: number;
  width: number;
  height: number;
};

type Token = { value: string; expiresAt: number };

let token: Token | null = null;

function apiUrl(): string {
  return process.env.CDEK_API_URL ?? "https://api.cdek.ru/v2";
}

async function getToken(): Promise<string | null> {
  const account = process.env.CDEK_ACCOUNT;
  const password = process.env.CDEK_SECURE_PASSWORD;
  if (!account || !password) return null;

  if (token && token.expiresAt - TOKEN_SAFETY_MS > Date.now()) {
    return token.value;
  }

  try {
    const response = await fetch(`${apiUrl()}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: account,
        client_secret: password,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[cdek] токен: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
    };

    if (!data.access_token) return null;

    token = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return token.value;
  } catch (error) {
    console.error(`[cdek] токен недоступен: ${String(error)}`);
    return null;
  }
}

/**
 * Стоимость и срок доставки в город получателя.
 * Возвращает `null`, если ключей нет или СДЭК не ответил.
 */
export async function quote(
  city: string,
  parcel: Parcel,
  toDoor: boolean,
): Promise<Omit<ShippingQuote, "source"> | null> {
  const access = await getToken();
  if (!access) return null;

  const from = process.env.CDEK_FROM_CITY ?? "Москва";

  try {
    const response = await fetch(`${apiUrl()}/calculator/tariff`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({
        type: 1,
        currency: 1,
        tariff_code: toDoor ? TARIFF_DOOR : TARIFF_PICKUP_POINT,
        from_location: { city: from },
        to_location: { city },
        packages: [
          {
            weight: parcel.weight,
            length: parcel.length,
            width: parcel.width,
            height: parcel.height,
          },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`[cdek] расчёт: ${response.status} ${await response.text()}`);
      return null;
    }

    const data = (await response.json()) as {
      total_sum?: number;
      period_min?: number;
      period_max?: number;
    };

    if (typeof data.total_sum !== "number") return null;

    return {
      price: Math.ceil(data.total_sum),
      minDays: data.period_min ?? 0,
      maxDays: data.period_max ?? 0,
    };
  } catch (error) {
    console.error(`[cdek] расчёт недоступен: ${String(error)}`);
    return null;
  }
}

/** Одна посылка на заказ: вес складываем, габариты берём наибольшие. */
export function packOrder(
  items: { shipping: Parcel; qty: number }[],
): Parcel {
  return items.reduce<Parcel>(
    (box, item) => ({
      weight: box.weight + item.shipping.weight * item.qty,
      length: Math.max(box.length, item.shipping.length),
      width: Math.max(box.width, item.shipping.width),
      height: Math.max(box.height, item.shipping.height),
    }),
    { weight: 0, length: 0, width: 0, height: 0 },
  );
}
