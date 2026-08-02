export type ArtKey =
  | "dashcam"
  | "alarm"
  | "headunit"
  | "speaker"
  | "sensor"
  | "bulb"
  | "jumpstarter"
  | "vacuum";

export type Spec = {
  label: string;
  value: string;
};

export type ProductImage = {
  /** Путь от корня `public/`. */
  src: string;
  /** Что на кадре: подпись под миниатюрой и основа для alt. */
  caption: string;
};

export type Category = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  art: ArtKey;
};

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  sku: string;
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  short: string;
  description: string;
  specs: Spec[];
  features: string[];
  /** Что лежит в коробке — первым пунктом само устройство. */
  included: string[];
  /** 360°-облёт, если он есть в библиотеке заказчика. */
  spin?: {
    video: string;
    poster: string;
    title: string;
    text: string;
  };
  /** Ракурсы товара. Пусто — рисуем векторную заглушку по категории. */
  images: ProductImage[];
};

export type CartLine = {
  slug: string;
  qty: number;
};

export type SortKey = "popular" | "price-asc" | "price-desc" | "new";
