import reviewsJson from "@/content/catalog/reviews.json";

export type Review = {
  name: string;
  rating: number;
  date: string;
  text: string;
};

export type ProductReviews = {
  /** Средняя оценка по всем покупателям, а не по опубликованным здесь. */
  average: number;
  total: number;
  withText: number;
  distribution: Record<string, number>;
  items: Review[];
};

const reviews = reviewsJson as Record<string, ProductReviews>;

export function getReviews(slug: string): ProductReviews | undefined {
  return reviews[slug];
}

export function getAllReviews(): Record<string, ProductReviews> {
  return reviews;
}

/** Сводка по всей линейке: суммарные оценки и взвешенный средний балл. */
export function getReviewsSummary() {
  const list = Object.values(reviews);
  const total = list.reduce((sum, r) => sum + r.total, 0);
  const average = list.reduce((sum, r) => sum + r.average * r.total, 0) / total;
  const published = list.reduce((sum, r) => sum + r.items.length, 0);
  return { total, average, published };
}

/** Дата вида 2026-07-21 → «21 июля 2026» (без хвостового «г.»). */
export function formatReviewDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return date
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    .replace(/\s*г\.$/, "");
}
