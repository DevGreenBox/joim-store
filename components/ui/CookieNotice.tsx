"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { metrikaId } from "@/lib/analytics";

/**
 * Уведомление о счётчике и файлах cookie.
 *
 * Показывается только там, где счётчик действительно подключён:
 * без `NEXT_PUBLIC_METRIKA_ID` предупреждать не о чем, а полоса
 * «мы используем cookie» на сайте, который их не ставит, — вранье
 * и лишний клик.
 *
 * Это уведомление, а не запрос разрешения: счётчик стартует сразу.
 * Ставить его после согласия честнее, но тогда до нажатия статистики
 * нет вовсе, и решать так должен заказчик, а не мы за него.
 * Место для такого переключателя — здесь, одной строкой.
 *
 * Ответ хранится в localStorage: cookie ради баннера о cookie
 * заводить не хочется.
 */

const STORAGE_KEY = "joim-cookie-notice-v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!metrikaId()) return;
    // Читаем после монтирования: на сервере localStorage нет, и разметка
    // разошлась бы с браузерной. Показ переносим на следующий кадр —
    // синхронный setState прямо в эффекте даёт лишний каскад отрисовок,
    // тот же приём уже применён в модели устройства.
    const frame = requestAnimationFrame(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-3 z-90 animate-rise rounded-2xl border border-line-strong bg-void/95 p-5 backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md"
    >
      <p className="text-[13px] leading-relaxed text-muted">
        Сайт собирает обезличенную статистику посещений через Яндекс.Метрику
        и хранит корзину в вашем браузере. Подробности —{" "}
        <Link
          href="/privacy"
          className="text-ink underline underline-offset-2 transition-opacity duration-300 hover:opacity-70"
        >
          в политике обработки данных
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setVisible(false);
        }}
        className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[13px] font-medium text-void transition-opacity duration-300 hover:opacity-85"
      >
        Понятно
      </button>
    </div>
  );
}
