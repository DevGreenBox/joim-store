"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ScrollTrack } from "@/components/ui/ScrollTrack";

/**
 * Закреплённый кадр, рядом с которым сменяется текст.
 *
 * На десктопе колонка с изображением стоит на месте, пока мимо проходят
 * шаги; активный шаг определяет наблюдатель по центру экрана, кадры
 * перекрываются по прозрачности. На мобильном закреплять нечего —
 * кадр едет вместе со своим шагом, а sticky не включается вовсе.
 *
 * Индекс меняется одним состоянием на всю секцию: наблюдателей три,
 * перерисовка одна. При `prefers-reduced-motion` смена мгновенная —
 * переход задан временем, а его глобально обнуляет `globals.css`.
 */

type Step = {
  title: string;
  text: string;
  image: string;
  alt: string;
};

export function StoryScroll({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const stepsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = stepsRef.current.filter(Boolean) as HTMLLIElement[];
    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.indexOf(entry.target as HTMLLIElement);
          if (index >= 0) setActive(index);
        }
      },
      // Узкая полоса по центру экрана: шаг становится активным, когда
      // доезжает до середины, а не когда только показался снизу.
      { rootMargin: "-45% 0px -45% 0px" },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <div className="mt-10 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
      {/* Закреплённый кадр — только с lg, на мобильном его нет в потоке */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+40px)]">
          <div className="relative isolate aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 grid-lines opacity-40"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{
                backgroundImage:
                  "radial-gradient(56% 52% at 50% 46%, rgba(140,197,63,0.16), transparent 70%)",
              }}
            />

            {steps.map((step, index) => (
              <Image
                key={step.image}
                src={step.image}
                alt={step.alt}
                fill
                sizes="(max-width: 1023px) 0px, 45vw"
                className="object-contain p-[12%] transition-opacity duration-700 ease-out-expo"
                style={{ opacity: index === active ? 1 : 0 }}
              />
            ))}

            <p className="readout absolute bottom-5 left-5 text-[12px] text-faint">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(steps.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* Рельс с бегущей полосой: она тянется от первого шага к третьему
          по мере прохождения секции. Значение `--track` пишет ScrollTrack
          прямо в узел, всё остальное считает CSS — во время скролла
          React не участвует. */}
      <ScrollTrack as="ol" className="relative grid gap-10 pl-8 lg:gap-0 lg:pl-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-[5px] w-px bg-line-strong"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-[5px] w-px origin-top bg-accent"
          style={{ transform: "scaleY(var(--track))" }}
        />
        {steps.map((step, index) => (
          <li
            key={step.title}
            ref={(node) => {
              stepsRef.current[index] = node;
            }}
            className="lg:flex lg:min-h-[62vh] lg:flex-col lg:justify-center"
          >
            {/* На мобильном кадр едет со своим шагом */}
            <div className="relative isolate mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2 lg:hidden">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 grid-lines opacity-40"
              />
              <Image
                src={step.image}
                alt={step.alt}
                fill
                sizes="(max-width: 1023px) 100vw, 0px"
                className="object-contain p-[8%]"
              />
            </div>

            <div className="relative">
              {/* Отметка на рельсе: загорается, когда полоса дошла
                  до её деления. Считает CSS, состояния тут нет. */}
              <span
                aria-hidden="true"
                className="absolute top-[1px] -left-8 z-10 block size-[11px] rounded-full border border-line-strong bg-void lg:-left-10"
              >
                <span
                  className="absolute inset-[2px] rounded-full bg-accent"
                  style={{
                    opacity: `clamp(0, calc((var(--track) - ${(
                      index / steps.length
                    ).toFixed(3)}) * 14), 1)`,
                  }}
                />
              </span>

              <p className="readout text-[11px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3
              className="font-display mt-3 text-[clamp(1.375rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.02em] transition-colors duration-500"
              style={{
                color:
                  index === active
                    ? "var(--color-ink)"
                    : "var(--color-faint)",
              }}
            >
              {step.title}
            </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ScrollTrack>
    </div>
  );
}
