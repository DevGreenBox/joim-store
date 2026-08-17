"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { FrameBackdrop } from "@/components/ui/FrameBackdrop";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Три шага в ряд и полоска под ними, которая наливается слева направо.
 *
 * Рамки стоят пустыми с самого начала — по ним сразу видно, что шагов
 * три и сколько осталось. Содержимое проявляется по мере хода полоски:
 * дошла до первой трети — появился первый кадр, и так далее.
 *
 * На десктопе блок закрепляется, и полоска отмеряет ровно тот путь,
 * который он висит на месте. На телефоне закреплять нечего: шаги идут
 * столбиком, полоска переезжает наверх и показывает, сколько секции
 * пройдено, а сами шаги видны сразу — ход полоски там не совпадает
 * с их положением на экране, и шаг мог оказаться перед глазами пустым.
 *
 * Значение `--track` пишется прямо в узел, всё остальное считает CSS:
 * во время скролла React не участвует.
 */

type Step = {
  title: string;
  text: string;
  image: string;
  alt: string;
};

/**
 * Доля хода полоски, на которой шаг начинает проявляться.
 *
 * Последний шаг входит на 0,7 и доходит до конца ровно к 1: множитель
 * в `--in` (globals.css) взят 3,33 = 1 / (1 − 0,7). Полоска заполнилась —
 * значит, все три шага уже на месте, и крутить дальше нечего.
 */
const ENTER = [0, 0.35, 0.7];

export function StoryScroll({
  steps,
  title,
  text,
}: {
  steps: Step[];
  title: string;
  text?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    if (!wrap || !pin) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrap.style.setProperty("--track", "1");
      return;
    }

    let frame = 0;

    function measure() {
      frame = 0;
      if (!wrap || !pin) return;

      const rect = wrap.getBoundingClientRect();
      const style = window.getComputedStyle(pin);
      let value = 0;

      if (style.position === "sticky") {
        // Пока блок закреплён, его верх стоит на `top`, а обёртка едет.
        // Отсчёт равен пройденной части этого пути — иначе полоска
        // не успевала дойти до конца к моменту, когда блок отлипает.
        const top = Number.parseFloat(style.top) || 0;
        const usable = rect.height - pin.offsetHeight;
        value = usable > 0 ? (top - rect.top) / usable : 0;
      } else {
        // Без закрепления считаем по проходу секции через экран.
        const start = window.innerHeight * 0.8;
        const end = window.innerHeight * 0.3;
        value = (start - rect.top) / (start - end + rect.height);
      }

      wrap.style.setProperty(
        "--track",
        Math.min(1, Math.max(0, value)).toFixed(4),
      );
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
  }, [steps.length]);

  // Высота обёртки минус высота закреплённого блока (84vh) и есть путь,
  // который полоска отмеряет: 193 − 84 = 109vh проката. Было 146vh,
  // потом 73vh — заказчик просил вернуть в полтора раза длиннее.
  return (
    <div
      ref={wrapRef}
      style={{ "--track": 0 } as React.CSSProperties}
      className="lg:h-[193vh]"
    >
      {/* Высота закреплённого блока минимальная, а не жёсткая: на низком
          экране содержимое должно раздвинуть его, а не упереться в край. */}
      <div
        ref={pinRef}
        className="flex flex-col lg:sticky lg:top-[calc(var(--header-h)+4vh)] lg:min-h-[84vh] lg:justify-center"
      >
        {/* Заголовок закреплён вместе с шагами: иначе он уезжал за экран
            первым же движением и весь прокат шёл без подписи. */}
        <SectionHeading title={title} text={text} className="order-1" />

        {/* Полоска: на телефоне над шагами, на десктопе под ними */}
        <div className="order-2 mt-10 mb-10 lg:order-3 lg:mt-12 lg:mb-0">
          <div className="relative h-px w-full bg-line">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-full origin-left bg-accent"
              style={{ transform: "scaleX(var(--track))" }}
            />
            {/* Разделители на стыках шагов. Считаем от той же ширины
                колонки, что и у сетки: колонка — (100% − 2 промежутка) / 3,
                метка стоит по центру промежутка. Проценты от общей ширины
                дали бы сдвиг — промежутки в них не учтены. */}
            {[1, 2].map((n) => (
              <span
                key={n}
                aria-hidden="true"
                className="absolute top-1/2 hidden h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-faint/60 lg:block"
                style={{
                  left: `calc((100% - 4rem) * ${n} / 3 + ${n * 2 - 1}rem)`,
                }}
              />
            ))}

            {/* Головка: по ней видно, под каким шагом сейчас полоска */}
            <span
              aria-hidden="true"
              className="absolute top-1/2 -ml-[3px] size-1.5 -translate-y-1/2 rounded-full bg-accent"
              style={{ left: "calc(var(--track) * 100%)" }}
            />
          </div>
        </div>

        <ol className="order-3 grid gap-8 lg:order-2 lg:mt-14 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="story-slide"
              style={{ "--at": ENTER[index] ?? 0 } as React.CSSProperties}
            >
              <div className="relative isolate h-[clamp(190px,32vh,340px)] overflow-hidden rounded-2xl border border-line bg-surface-2">
                <FrameBackdrop />
                {/* Кадры съёмочные, с фоном, а не вырезанные по контуру:
                    заполняют рамку целиком. Пока шаг не проявился, под ними
                    видна фирменная подложка. */}
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 30vw"
                  className="object-cover"
                  style={{ opacity: "var(--in)" }}
                />
              </div>

              <div
                style={{
                  opacity: "var(--in)",
                  transform: "translateY(calc((1 - var(--in)) * 14px))",
                }}
              >
                <p className="readout mt-6 text-[11px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-2.5 text-h3 font-semibold">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
