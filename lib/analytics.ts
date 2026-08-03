/**
 * Цели Яндекс.Метрики.
 *
 * Счётчик подключается только при заданном `NEXT_PUBLIC_METRIKA_ID`.
 * Без него `track()` ничего не делает и в браузер не уходит ни байта
 * стороннего кода — как и с Telegram, и с СДЭК: сайт обязан работать
 * до подключения сервисов.
 *
 * Идентификаторы целей держим здесь списком, а не строками по месту
 * вызова: опечатка в имени цели ничего не сломает и молча испортит
 * статистику, а так их видно все сразу и они проверяются типами.
 */

export const GOALS = {
  /** Товар положили в корзину — с карточки, из каталога или подбора. */
  addToCart: "add-to-cart",
  /** Дошли до оформления. */
  checkoutOpen: "checkout-open",
  /** Заказ принят. Главная цель. */
  orderDone: "order-done",
  /** Ответили хотя бы на один вопрос подбора. */
  pickerUsed: "picker-used",
  /** Запустили промо-ролик. */
  videoPlay: "video-play",
  /** Отправили анкету «остались вопросы». */
  leadSent: "lead-sent",
} as const;

export type Goal = (typeof GOALS)[keyof typeof GOALS];

type MetrikaFn = (id: number, action: string, ...rest: unknown[]) => void;

declare global {
  interface Window {
    ym?: MetrikaFn;
  }
}

function counter(): number | null {
  const raw = process.env.NEXT_PUBLIC_METRIKA_ID;
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Цели, отправленные до того, как счётчик успел определиться.
 *
 * Счётчик грузится после гидратации, а часть целей срабатывает сразу
 * при показе страницы — например «открыли оформление». Без очереди
 * такие вызовы просто терялись: `window.ym` ещё не было, и `track()`
 * молча выходил. Проверено на странице оформления — цель не доходила.
 */
const pending: { goal: Goal; params?: Record<string, unknown> }[] = [];
let watcher: ReturnType<typeof setInterval> | null = null;

/** Ждём счётчик не дольше десяти секунд: не пришёл — значит заблокирован. */
const WAIT_STEP_MS = 300;
const WAIT_LIMIT_MS = 10_000;

function flush(id: number): void {
  while (pending.length > 0) {
    const item = pending.shift();
    if (item) window.ym?.(id, "reachGoal", item.goal, item.params);
  }
}

export function track(goal: Goal, params?: Record<string, unknown>): void {
  const id = counter();
  if (!id || typeof window === "undefined") return;

  if (window.ym) {
    flush(id);
    window.ym(id, "reachGoal", goal, params);
    return;
  }

  pending.push({ goal, params });
  if (watcher) return;

  let waited = 0;
  watcher = setInterval(() => {
    waited += WAIT_STEP_MS;
    if (window.ym) {
      clearInterval(watcher!);
      watcher = null;
      flush(id);
    } else if (waited >= WAIT_LIMIT_MS) {
      clearInterval(watcher!);
      watcher = null;
      pending.length = 0;
    }
  }, WAIT_STEP_MS);
}

export function metrikaId(): number | null {
  return counter();
}
