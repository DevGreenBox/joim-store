import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Слово-конструкция: огромное слово, из-за которого выходит вырезанный
 * по контуру прибор.
 *
 * Это главный приём лендинга, взятый из двух референсов заказчика
 * (`references/image 29.png` и `references/hero.png`): предмет стоит
 * перед словом и перекрывает его собой. Слово читается не целиком —
 * и именно поэтому его читают.
 *
 * Правило перекрытия: прибор закрывает от трети до половины длины слова.
 * Меньше — приём не виден, больше — слово перестаёт узнаваться.
 *
 * Слово помечено `aria-hidden`: это фигура, а не заголовок. Смысл несёт
 * настоящий заголовок рядом, иначе скринридер прочитает «5000» дважды.
 */
export function Slab({
  word,
  src,
  alt,
  width,
  height,
  /** Доля ширины, которую занимает прибор. Кадры разной пропорции. */
  figure = "w-[58%] sm:w-[46%] lg:w-[38%]",
  /** Куда сдвинуть прибор относительно слова. */
  place = "left-1/2 -translate-x-1/2",
  tone = "text-surface-2",
  className = "",
  imageSizes = "(max-width: 639px) 58vw, (max-width: 1023px) 46vw, 38vw",
  children,
  eager = false,
}: {
  word: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  figure?: string;
  place?: string;
  tone?: string;
  className?: string;
  imageSizes?: string;
  children?: ReactNode;
  eager?: boolean;
}) {
  return (
    <div className={`relative isolate ${className}`}>
      <span
        aria-hidden="true"
        className={`font-display pointer-events-none block text-center leading-[0.82] font-bold tracking-[-0.05em] select-none ${tone}`}
        style={{ fontSize: "clamp(5.5rem, 19vw, 15rem)" }}
      >
        {word}
      </span>

      <div
        className={`pointer-events-none absolute inset-y-0 ${place} ${figure}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={imageSizes}
          {...(eager ? { preload: true } : {})}
          className="h-full w-full object-contain [filter:drop-shadow(0_40px_60px_rgba(0,0,0,0.65))]"
        />
      </div>

      {children}
    </div>
  );
}
