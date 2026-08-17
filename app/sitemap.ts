import type { MetadataRoute } from "next";

import { getCategories, getProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", priority: 1 },
    { path: "/catalog", priority: 0.9 },
    { path: "/warranty", priority: 0.7 },
    { path: "/gifts", priority: 0.7 },
    { path: "/corporate", priority: 0.7 },
    { path: "/how-to-choose", priority: 0.6 },
    { path: "/reviews", priority: 0.6 },
    { path: "/delivery", priority: 0.5 },
    { path: "/about", priority: 0.5 },
    { path: "/contacts", priority: 0.6 },
    { path: "/privacy", priority: 0.2 },
    { path: "/offer", priority: 0.2 },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${site.url}${page.path}`,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    ...getCategories().map((category) => ({
      url: `${site.url}/catalog/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...getProducts().map((product) => ({
      url: `${site.url}/product/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
