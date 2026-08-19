import reviewsJson from "@/content/catalog/reviews.json";

export type Review = {
  name: string;
  rating: number;
  date: string;
  text: string;
  /**
   * Фото и видео от покупателя. Появятся файлы — лягут сюда, стена
   * покажет их сама: разметка на это рассчитана.
   *
   * `demo: true` — заглушка на время показа: наша съёмка на месте
   * будущего кадра покупателя. Такие вставки ищутся одним `grep demo`
   * по `content/catalog/reviews.json` и снимаются перед запуском.
   */
  photo?: { src: string; alt: string; demo?: boolean };
  video?: { src: string; poster: string; ratio: string; demo?: boolean };
};

/**
 * Отзыв вместе с моделью, о которой он написан, — для общей ленты.
 * `cover` — кадр этой модели: на стене он идёт миниатюрой в подписи.
 * Без него лента из одних текстовых карточек читается серой простынёй.
 */
export type FeedReview = Review & {
  product: string;
  slug: string;
  cover?: { src: string; alt: string };
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

/**
 * Сводка по опубликованным отзывам, а не по сводным оценкам площадок.
 *
 * Раньше считался взвешенный балл по всем оценкам с маркетплейсов — 4,7.
 * Заказчик просил показывать 5,0 и не упоминать площадки: цифра со стороны
 * уводит человека туда, откуда её взяли. На сайте публикуются отобранные
 * отзывы, все они на пять, поэтому 5,0 — это честный балл своей ленты,
 * а не подогнанный.
 */
export function getReviewsSummary() {
  const items = Object.values(reviews).flatMap((r) => r.items);
  const total = items.length;
  const average = total
    ? items.reduce((sum, item) => sum + item.rating, 0) / total
    : 0;
  return { total, average, published: total };
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

/**
 * Плоская лента всех отзывов, новые сверху.
 *
 * Стена на странице отзывов не делится по моделям: заказчик просил
 * ленту в духе Pinterest, где содержимое идёт сплошным потоком, а модель
 * — подпись на карточке, а не заголовок раздела.
 */
export function getReviewFeed(
  names: Record<string, string>,
  covers: Record<string, { src: string; alt: string }> = {},
): FeedReview[] {
  return Object.entries(reviews)
    .flatMap(([slug, data]) =>
      data.items.map((item) => ({
        ...item,
        slug,
        product: names[slug] ?? slug,
        cover: covers[slug],
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
