import siteJson from "@/content/pages/site.json";

export const site = siteJson;

/**
 * Главное меню. Отзывы живут в подвале и на главной — в шапке им тесно.
 *
 * `also` — ветки, при которых пункт остаётся подсвеченным: карточка товара
 * лежит на `/product/`, но покупатель по-прежнему в каталоге.
 */
export const nav = [
  { href: "/catalog", label: "Каталог", also: ["/product"] },
  { href: "/delivery", label: "Доставка" },
  { href: "/warranty", label: "Гарантия" },
  { href: "/corporate", label: "Компаниям" },
  { href: "/about", label: "О бренде" },
  { href: "/contacts", label: "Контакты" },
] as const;

/** Полный список разделов — для подвала и карты сайта. */
export const allPages = [
  ...nav,
  { href: "/reviews", label: "Отзывы" },
] as const;

/**
 * Правовые документы. Отдельным списком, а не в общей навигации:
 * их место — нижняя строка подвала, где их и ищут.
 */
export const legalPages = [
  { href: "/privacy", label: "Обработка персональных данных" },
  { href: "/offer", label: "Условия продажи" },
] as const;

