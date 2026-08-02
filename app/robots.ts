import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Страницы личного сценария покупки в индексе не нужны.
      disallow: ["/cart", "/checkout"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
