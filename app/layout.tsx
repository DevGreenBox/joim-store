import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Одна гарнитура на весь сайт плюс её моноширинная пара.
 * Geist — на нём держится и текст, и заголовки; Geist Mono отвечает
 * за «приборную» часть: надзаголовки, характеристики, артикулы.
 */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "пусковое устройство",
    "пуско-зарядное устройство",
    "JOIM Easy Start",
    "ES-19",
    "ES-29",
    "автомобильный пылесос",
    "JOIM PVC-1",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

/**
 * Ставит атрибут `data-js` до первой отрисовки. Только при нём CSS прячет
 * блоки с `data-reveal` — если JS выключен, весь контент виден сразу.
 * Атрибут, а не класс: className на <html> принадлежит React.
 */
const enableMotion = `document.documentElement.setAttribute('data-js','')`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableMotion }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-void"
        >
          Перейти к содержимому
        </a>

        <Header />
        <main id="main" className="flex-1 pt-(--header-h)">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
