import categoriesJson from "@/content/catalog/categories.json";
import productsJson from "@/content/catalog/products.json";
import type { Category, Product, SortKey } from "@/lib/types";

const categories = categoriesJson as Category[];
const products = productsJson as Product[];

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export function getFeatured(limit = 6): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))].sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export function countByCategory(slug: string): number {
  return products.filter((p) => p.category === slug).length;
}

/** Похожие товары: та же категория, кроме самого товара. */
export function getRelated(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, limit);
}

export const PRICE_BUCKETS = [
  { id: "0-10000", label: "до 10 000 ₽", min: 0, max: 10000 },
  { id: "10000-30000", label: "10 000 — 30 000 ₽", min: 10000, max: 30000 },
  { id: "30000-", label: "от 30 000 ₽", min: 30000, max: Infinity },
] as const;

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "popular", label: "По популярности" },
  { id: "price-asc", label: "Сначала дешевле" },
  { id: "price-desc", label: "Сначала дороже" },
  { id: "new", label: "По названию" },
];

export type CatalogQuery = {
  category?: string;
  brand?: string;
  price?: string;
  sort?: SortKey;
  q?: string;
};

/**
 * Фильтрация и сортировка каталога.
 * Все параметры приходят из URL — состояние каталога живёт в адресной строке,
 * поэтому страницу можно переслать ссылкой и она откроется в том же виде.
 */
export function queryProducts(query: CatalogQuery): Product[] {
  const bucket = PRICE_BUCKETS.find((b) => b.id === query.price);
  const search = query.q?.trim().toLowerCase();

  let result = products.filter((p) => {
    if (query.category && p.category !== query.category) return false;
    if (query.brand && p.brand !== query.brand) return false;
    if (bucket && (p.price < bucket.min || p.price >= bucket.max)) return false;
    if (search) {
      const haystack =
        `${p.name} ${p.brand} ${p.short} ${p.sku}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  switch (query.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case "new":
      result = [...result].sort((a, b) => a.name.localeCompare(b.name, "ru"));
      break;
    default:
      result = [...result].sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      );
  }

  return result;
}

/** Ключ категории → векторная иллюстрация, пока нет фотографий товара. */
export function artFor(product: Product): Category["art"] {
  return getCategory(product.category)?.art ?? "dashcam";
}
