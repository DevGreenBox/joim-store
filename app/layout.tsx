import type { Metadata, Viewport } from "next";
import { Geist_Mono, Golos_Text, Rubik } from "next/font/google";

import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Analytics } from "@/components/ui/Analytics";
import { CookieNotice } from "@/components/ui/CookieNotice";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Пара гарнитур подобрана по скелету настоящего Panton, а не на глаз.
 *
 * С демо-файлов Panton сняты пропорции: cap 710, x-height 520 (x/cap
 * 0,73 — очень крупные строчные), «O» шириной 0,80 от высоты, узкие
 * апроши. По этим числам прогнаны одиннадцать кириллических гротесков.
 * Ближе всех **Rubik**: x/cap 0,743, «O» 0,86 — и та же геометрия
 * со смягчёнными стыками, которой Panton и узнаётся. Manrope пробовали
 * вторым: он суше, но на мелких заголовках проваливается по весу.
 *
 * Сам Panton в заголовках стоять не может: в демо-версии нет строчных,
 * все буквы нарисованы прописными. Исходники остались в `fonts/`
 * с разбором в `fonts/LICENSE.md`.
 *
 * Текст — **Golos Text**: кириллица у него не адаптирована с латиницы,
 * а нарисована первой, и на длинном абзаце это видно по ритму. x/cap
 * 0,757 против 0,743 у Rubik — строчные одного роста, пара не спорит.
 *
 * Geist Mono остаётся на «приборной» части: надзаголовки,
 * характеристики, артикулы.
 */
const rubik = Rubik({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const golos = Golos_Text({
  variable: "--font-text",
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
      className={`${rubik.variable} ${golos.variable} ${geistMono.variable} h-full antialiased`}
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
