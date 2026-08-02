"use client";

import { useEffect, useRef } from "react";

/**
 * Число, которое доходит до своего значения, когда доезжает до экрана.
 *
 * Отсчёт здесь не украшение: у бренда «приборная» пластика, и стрелка,
 * доходящая до отметки, — её прямое продолжение. Поэтому он короткий
 * и без отскока: доехал и встал.
 *
 * Что важно в реализации:
 * — на сервере и в первой отрисовке стоит конечное значение. Без JS
 *   и в поиске видно настоящее число, а не ноль;
 * — во время отсчёта меняется `textContent`, а не состояние: React
 *   не перерисовывает ничего шестьдесят раз в секунду;
 * — цифры набраны табличными (`num`), поэтому ширина не пляшет;
 * — при `prefers-reduced-motion` отсчёта нет вовсе.
 */

const DURATION = 900;

/** «8 800» → 8800, «4,7» → 4.7. Пробелы тут неразрывные, поэтому \s. */
function parse(value: string): { target: number; decimals: number } {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const target = Number.parseFloat(normalized);
  const decimals = normalized.includes(".")
    ? normalized.split(".")[1].length
    : 0;
  return { target, decimals };
}

export function CountUp({ value, from = 0 }: { value: string; from?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const { target, decimals } = parse(value);
    if (!Number.isFinite(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const format = new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    let frame = 0;
    let start = 0;

    function step(now: number) {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / DURATION);
      // easeOutExpo — та же кривая, что у остальных движений на сайте.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      if (node) node.textContent = format.format(from + (target - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, from]);

  return <span ref={ref}>{value}</span>;
}
