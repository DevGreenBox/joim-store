import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Analytics } from "@/components/ui/Analytics";
import { CookieNotice } from "@/components/ui/CookieNotice";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Заголовки — фирменный Panton Black, всё остальное Geist.
 *
 * Panton у бренда на упаковке и в карточках маркетплейсов, и заголовки
 * им сразу читаются «своими». Ставить его в текст нельзя: это очень
 * жирное начертание, абзац из него превращается в чёрную плиту.
 * Поэтому пара: Panton кричит, Geist рассказывает, Geist Mono отвечает
 * за «приборную» часть — надзаголовки, характеристики, артикулы.
 *
 * Файл демо-версии, лицензия которой прямо разрешает `@font-face`
 * на сайтах. В нём 66 кириллических знаков — весь нужный алфавит.
 *
 * Диапазон `font-weight: 100 900` при одном начертании — не хитрость,
 * а защита: браузер перестаёт дорисовывать искусственный жир там, где
 * вёрстка просит 600, и берёт настоящие контуры.
 */
const panton = localFont({
  src: "../public/fonts/panton-black.woff2",
  variable: "--font-panton",
  weight: "100 900",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

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
      className={`${geist.variable} ${geistMono.variable} ${panton.variable} h-full antialiased`}
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
        <CookieNotice />
        <Analytics />
      </body>
    </html>
  );
}
