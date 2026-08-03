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
