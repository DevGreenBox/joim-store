"use client";

import { useState } from "react";

import { AddToCart } from "@/components/ui/AddToCart";
import { ButtonLink } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { GOALS, track } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Подбор модели.
 *
 * Ось подбора здесь не «сколько литров у мотора»: обе модели поднимают
 * практически любой гражданский двигатель, и вопрос про объём на любом
 * ответе вернул бы обе. Расходятся они вдвое по ёмкости и числу запусков,
 * поэтому спрашиваем про запас: сколько техники, где зимует, где розетка.
 *
 * Ответ показывается сразу, кнопки «подобрать» нет — иначе половина
 * посетителей уходит, не нажав. Стартовые ответы выбраны за покупателя
 * (самый частый случай), пустого состояния не бывает.
 */

type Option = {
  id: string;
  label: string;
  weight: number;
};

type Question = {
  id: string;
  label: string;
  options: Option[];
};

type Result = {
  text: string;
  marks: string[];
};

type Props = {
  questions: Question[];
  scale: { from: string; to: string; label: string };
  results: Record<string, Result>;
  /** Две модели: первой — та, что выигрывает при отрицательной сумме. */
  products: [Product, Product];
};

export function ModelPickerForm({
  questions,
  scale,
  results,
  products,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.options[0].id])),
  );

  const score = questions.reduce((sum, question) => {
    const option = question.options.find(
      (item) => item.id === answers[question.id],
    );
    return sum + (option?.weight ?? 0);
  }, 0);

  const min = questions.reduce(
    (sum, q) => sum + Math.min(...q.options.map((o) => o.weight)),
    0,
  );
  const max = questions.reduce(
    (sum, q) => sum + Math.max(...q.options.map((o) => o.weight)),
    0,
  );

  const product = score > 0 ? products[1] : products[0];
  const result = results[product.slug];
  // Метка ходит по шкале непрерывно: видно не только ответ, но и насколько
  // он уверенный. Края поджаты, чтобы точка не съезжала за линию.
  const position = 4 + ((score - min) / (max - min)) * 92;

  return (
    <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:mt-16 lg:grid-cols-[1.1fr_1fr]">
      <Reveal className="flex flex-col bg-surface p-6 lg:p-10">
        <div className="space-y-8 lg:space-y-10">
          {questions.map((question, index) => (
            <fieldset key={question.id}>
              <legend className="flex items-baseline gap-3">
                <span className="readout text-[11px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-snug font-medium text-ink">
                  {question.label}
                </span>
              </legend>

              <div className="mt-4 grid gap-2 pl-8">
                {question.options.map((option) => {
                  const checked = answers[question.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-[14px] leading-snug transition-colors duration-300 ${
                        checked
                          ? "border-accent/40 bg-accent/10 text-ink"
                          : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink active:border-line-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={checked}
                        onChange={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: option.id,
                          }));
                          track(GOALS.pickerUsed, { question: question.id });
                        }}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`size-2 shrink-0 rounded-full transition-colors duration-300 ${
                          checked ? "bg-accent" : "bg-line-strong"
                        }`}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        {/* Шкала запаса: метка едет между моделями по мере ответов */}
        <div className="mt-10 border-t border-line pt-8 lg:mt-auto">
          <p className="readout text-[11px] tracking-[0.12em] text-faint uppercase">
            {scale.label}
          </p>
          <div className="relative mt-5 h-px bg-line-strong">
            <span
              aria-hidden="true"
              className="absolute -top-[5px] size-[11px] -translate-x-1/2 rounded-full border border-void bg-accent transition-[left] duration-500 ease-out-expo"
              style={{ left: `${position}%` }}
            />
          </div>
          <div className="mt-4 flex justify-between">
            <span className="readout text-[12px] text-muted">{scale.from}</span>
            <span className="readout text-[12px] text-muted">{scale.to}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={90} className="flex flex-col bg-surface p-6 lg:p-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
          <ProductImage
            key={product.slug}
            product={product}
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="animate-fade size-full"
          />
        </div>

        <h3 className="font-display mt-7 text-[clamp(1.375rem,2.6vw,1.875rem)] leading-tight font-semibold tracking-[-0.02em]">
          {product.name}
        </h3>

        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          {result?.text}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {result?.marks.map((mark) => (
            <li
              key={mark}
              className="readout rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12px] leading-none text-muted"
            >
              {mark}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <p className="num font-display text-[clamp(1.5rem,3vw,2rem)] leading-none font-semibold tracking-[-0.03em]">
            {formatPrice(product.price)}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AddToCart
              slug={product.slug}
              inStock={product.inStock}
              variant="full"
            />
            <ButtonLink
              href={`/product/${product.slug}`}
              variant="outline"
              size="md"
              arrow
            >
              Подробнее
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
