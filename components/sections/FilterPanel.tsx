"use client";

import { useState, type ReactNode } from "react";

/**
 * На мобильном фильтры свёрнуты за кнопкой, на десктопе видны всегда.
 * Скрытие делает класс `.js .is-collapsed` — без JS панель остаётся открытой,
 * а не превращается в нерабочую кнопку.
 */
export function FilterPanel({
  children,
  total,
}: {
  children: ReactNode;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="catalog-filters"
        className="mb-5 flex w-full items-center justify-between rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink transition-colors duration-300 hover:border-line-strong lg:hidden"
      >
        <span className="flex items-center gap-2.5">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
            <path
              d="M2 4h12M4 8h8M6.5 12h3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          Фильтры
        </span>
        <span className="num text-xs text-faint">{total}</span>
      </button>

      <div
        id="catalog-filters"
        className={open ? undefined : "is-collapsed"}
        style={
          open
            ? { animation: "rise 0.4s var(--ease-out-expo) both" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
