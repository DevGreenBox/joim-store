"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Ставит на элемент переменную `--track` — от 0 до 1 по мере того,
 * как блок проходит через экран.
 *
 * Значение пишется прямо в стиль узла, без состояния и перерисовок:
 * во время скролла React не участвует вообще. Всё, что от него зависит,
 * считается в CSS через clamp() — так шкала и точки загораются
 * непрерывно, а не ступеньками по классам.
 *
 * При `prefers-reduced-motion` сразу выставляем 1: шкала просто
 * нарисована целиком.
 */

export function ScrollTrack({
  children,
  as: Tag = "div",
  className,
  /** Доля высоты экрана, на которой отсчёт начинается и заканчивается. */
  from = 0.85,
  to = 0.45,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.style.setProperty("--track", "1");
      return;
    }

    let frame = 0;

    function measure() {
      frame = 0;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const start = window.innerHeight * from;
      const end = window.innerHeight * to;
      // Верх блока идёт от «start» к «end»; хвост добираем высотой блока.
      const span = start - end + rect.height;
      const passed = start - rect.top;
      const value = Math.min(1, Math.max(0, passed / span));
      node.style.setProperty("--track", value.toFixed(4));
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [from, to]);

  return (
    <Tag ref={ref} className={className} style={{ "--track": 0 }}>
      {children}
    </Tag>
  );
}
