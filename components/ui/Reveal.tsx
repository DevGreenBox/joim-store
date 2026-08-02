"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Появление блока при попадании в область просмотра.
 *
 * Один общий IntersectionObserver на весь документ — не заводим по
 * наблюдателю на каждый блок и не слушаем scroll. Элемент отписывается
 * сразу после показа, поэтому во время скролла ничего не считается.
 *
 * Начальное скрытие делает CSS (`.js [data-reveal]`), класс `js` ставится
 * инлайн-скриптом до первой отрисовки — без JS контент виден сразу.
 */

let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          sharedObserver?.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
  }
  return sharedObserver;
}

type RevealProps = {
  children: ReactNode;
  /** Тег обёртки: div по умолчанию, li/section/tr — по месту. */
  as?: ElementType;
  className?: string;
  /** Задержка в мс — для лесенки внутри группы. */
  delay?: number;
  /** Сдвиг по вертикали в пикселях, 0 — только прозрачность. */
  y?: number;
};

export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = getObserver();
    if (!observer) {
      // Браузер без IntersectionObserver — показываем сразу.
      node.classList.add("is-revealed");
      return;
    }

    observer.observe(node);
    return () => observer.unobserve(node);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          ...(y !== undefined ? { "--reveal-y": `${y}px` } : null),
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
