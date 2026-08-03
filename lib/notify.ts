/**
 * Уведомления в Telegram: заказ и анкета «остались вопросы».
 *
 * Модуль серверный: он читает ключи из окружения и импортируется только
 * из `lib/actions.ts` с директивой `"use server"`. Пакет `server-only`
 * не подключаем — в проекте его нет, а Next разрешает такой импорт
 * только собственным алиасом при сборке, и полагаться на это не хочется.
 *
 * Ключи берутся из окружения: `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`.
 * Пока их нет, отправка молча пропускается, а заказ пишется в лог сервера —
 * так витрину можно показывать без боевых доступов, и при этом никакой
 * заявки не теряется незаметно: в логе она есть.
 *
 * Ошибка отправки не роняет оформление. Покупатель уже нажал кнопку,
 * и терять заказ из-за недоступного Telegram нельзя — поэтому сбой
 * уходит в лог, а заказ подтверждается.
 */

const API = "https://api.telegram.org";
/** Дольше ждать нет смысла: покупатель стоит перед формой. */
const TIMEOUT_MS = 4000;

export type OrderNotice = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  delivery: string;
  city: string;
  address: string;
  comment: string;
  itemsCount: number;
  total: number;
  items: string;
};

const DELIVERY_LABELS: Record<string, string> = {
  pickup: "Самовывоз",
  courier: "Курьер по Москве",
  cdek: "СДЭК",
  post: "Почта России",
};

/** Экранируем разметку: имя или адрес могут содержать < и &. */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function compose(order: OrderNotice): string {
  const lines = [
    `<b>Заказ ${escape(order.orderId)}</b>`,
    "",
    `Имя: ${escape(order.name)}`,
    `Телефон: ${escape(order.phone)}`,
    order.email ? `Почта: ${escape(order.email)}` : "",
    `Доставка: ${DELIVERY_LABELS[order.delivery] ?? escape(order.delivery)}`,
    order.city ? `Город: ${escape(order.city)}` : "",
    order.address ? `Адрес: ${escape(order.address)}` : "",
    "",
    `Состав: ${escape(order.items)}`,
    `Позиций: ${order.itemsCount}`,
    `Сумма: ${order.total.toLocaleString("ru-RU")} ₽`,
    order.comment ? `\nКомментарий: ${escape(order.comment)}` : "",
  ];

  return lines.filter((line) => line !== "").join("\n");
}

export type LeadNotice = {
  name: string;
  phone: string;
  topic: string;
  question: string;
  page: string;
};

function composeLead(lead: LeadNotice): string {
  return [
    "<b>Вопрос с сайта</b>",
    "",
    `Имя: ${escape(lead.name)}`,
    `Телефон: ${escape(lead.phone)}`,
    lead.topic ? `Тема: ${escape(lead.topic)}` : "",
    lead.page ? `Со страницы: ${escape(lead.page)}` : "",
    lead.question ? `\n${escape(lead.question)}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** Анкета «остались вопросы» — тот же путь, что и у заказа. */
export async function notifyLead(lead: LeadNotice): Promise<void> {
  await send("lead", composeLead(lead));
}

export async function notifyOrder(order: OrderNotice): Promise<void> {
  await send("order", compose(order));
}

async function send(kind: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    console.info(
      `[${kind}] Telegram не настроен, заявка только в логе:\n${text}`,
    );
    return;
  }

  try {
    const response = await fetch(`${API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(
        `[${kind}] Telegram ответил ${response.status}: ${details}\n${text}`,
      );
    }
  } catch (error) {
    console.error(`[${kind}] Telegram недоступен: ${String(error)}\n${text}`);
  }
}
