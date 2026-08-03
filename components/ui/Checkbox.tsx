import type { ReactNode } from "react";

/**
 * Согласие: кружок, в котором проявляется зелёная галочка.
 *
 * Родная квадратная галочка браузера рисуется системой и в тёмной теме
 * выглядит чужой — в Windows она синяя, в macOS своя. Здесь тот же
 * росчерк, что на экране «Анкета у нас» и на кнопке «в корзину»:
 * одна форма на весь сайт.
 *
 * Само поле остаётся на месте — оно `sr-only`, а не `display: none`:
 * так работают Tab, пробел, автозаполнение и отправка формы. Кружок
 * реагирует на состояние поля соседним селектором (`peer`), без
 * состояния в React.
 *
 * Галочка не проявляется, а прочерчивается: `pathLength={1}` приводит
 * длину линии к единице, а `--tick` двигает начало пунктира от 1 к 0.
 */

export function Checkbox({
  name,
  children,
  className = "",
}: {
  name: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted ${className}`}
    >
      <input type="checkbox" name={name} className="peer sr-only" />

      <span
        aria-hidden="true"
        className="mt-px grid size-[22px] shrink-0 place-items-center rounded-full border border-line-strong transition-colors duration-300 [--tick:1] peer-hover:border-accent/50 peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:[--tick:0] peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface sm:size-5"
      >
        <svg viewBox="0 0 24 24" className="size-[13px]">
          <path
            d="m6 12.5 4 4 8-9"
            pathLength={1}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-[stroke-dashoffset] duration-500 ease-out-expo"
            style={{ strokeDasharray: 1, strokeDashoffset: "var(--tick)" }}
          />
        </svg>
      </span>

      <span>{children}</span>
    </label>
  );
}
