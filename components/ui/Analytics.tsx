"use client";

import Script from "next/script";

import { metrikaId } from "@/lib/analytics";

/**
 * Счётчик Яндекс.Метрики.
 *
 * `afterInteractive`, а не `lazyOnload`: при простое браузера счётчик
 * определялся позже, чем срабатывали цели вроде «открыли оформление»,
 * и они терялись. Тяжёлый `tag.js` сниппет всё равно подгружает сам
 * и асинхронно — здесь выполняется только объявление `ym`.
 * Очередь в `lib/analytics.ts` страхует от гонки и в этом случае.
 *
 * `<noscript>` с пикселем не ставим: он даёт запрос ещё до того, как
 * основной скрипт решит, что делать, и статистику это не улучшает.
 *
 * Без `NEXT_PUBLIC_METRIKA_ID` компонент не рендерит ничего — в браузер
 * не уходит ни байта стороннего кода.
 */
export function Analytics() {
  const id = metrikaId();
  if (!id) return null;

  return (
    <Script id="ym-counter" strategy="afterInteractive">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(${id}, "init", { defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true });
      `}
    </Script>
  );
}
