import path from "node:path";

import type { NextConfig } from "next";

import products from "./content/catalog/products.json" with { type: "json" };

const productSlugs = products.map((product) => product.slug);

const nextConfig: NextConfig = {
  // Рядом лежит внешний pnpm-workspace, поэтому корень указываем явно —
  // иначе Turbopack выбирает родительскую папку и предупреждает об этом.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },

  images: {
    // С шестнадцатой версии список качеств закрыт, и 75 — единственное
    // разрешённое по умолчанию. 92 добавлено ради фона первого экрана:
    // он один растянут во всю ширину окна, и пережатие на нём видно.
    // Остальные картинки остаются на 75.
    qualities: [75, 92],
  },

  // Товары переехали с `/catalog/[slug]` на `/product/[slug]`: сегмент
  // после `/catalog/` занят категориями. Слаги перечислены поимённо —
  // общее правило перехватывало бы и сами категории.
  async redirects() {
    return productSlugs.map((slug) => ({
      source: `/catalog/${slug}`,
      destination: `/product/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
