import siteJson from "@/content/pages/site.json";

export const site = siteJson;

/** Главное меню. Отзывы живут в подвале и на главной — в шапке им тесно. */
export const nav = [
  { href: "/catalog", label: "Каталог" },
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

/** Порог бесплатной доставки, ₽ */
export const FREE_SHIPPING_FROM = 15000;

/** Стоимость курьера по Москве, ₽ */
export const COURIER_PRICE = 490;
