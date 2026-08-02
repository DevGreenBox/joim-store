import Image from "next/image";

import { ProductArt } from "@/components/ui/ProductArt";
import { artFor } from "@/lib/catalog";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  /** Атрибут sizes для next/image — обязателен при fill. */
  sizes: string;
  /**
   * Грузить сразу, не дожидаясь подхода к экрану, — для плиток первого
   * ряда каталога. Без `fetchPriority="high"`: какая из них окажется LCP,
   * зависит от ширины экрана, и поднимать приоритет всем сразу
   * документация просит не делать.
   */
  eager?: boolean;
  /**
   * Для единственной картинки первого экрана, она же LCP. Пришло на смену
   * устаревшему в Next 16 `priority`.
   *
   * Замеряли: `<link rel="preload">` в `head` Next вставляет и здесь,
   * и при `loading="eager"` — разница в намерении, а не в разметке.
   * Поэтому проп отдельный: видно, где предзагрузка одна и осознанная,
   * а где это побочный эффект от первого ряда каталога.
   */
  preload?: boolean;
  className?: string;
};

/**
 * Изображение товара. Пока фотографий нет — рисуем векторную иллюстрацию
 * категории на «световом» фоне. Появятся файлы в `product.images` —
 * автоматически подхватятся через next/image, без правок вёрстки.
 */
/** Стабильное число из slug: одинаковое на сервере и в браузере. */
function hash(value: string): number {
  let sum = 0;
  for (let i = 0; i < value.length; i += 1) sum = (sum * 31 + value.charCodeAt(i)) % 997;
  return sum;
}

export function ProductImage({
  product,
  sizes,
  eager = false,
  preload = false,
  className = "",
}: Props) {
  const photo = product.images[0];
  // Пока товары в одной категории делят иллюстрацию, разводим их светом:
  // положение и размер пятна выводим из slug — плитки перестают выглядеть
  // копиями друг друга, а разметка остаётся детерминированной.
  const seed = hash(product.slug);
  const glowX = 40 + (seed % 21);
  const glowSize = 54 + (seed % 13);

  return (
    <div
      className={`relative isolate overflow-hidden bg-surface-2 ${className}`}
    >
      {/* Световое пятно за товаром — даёт объём плоской картинке */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(${glowSize}% 52% at ${glowX}% 42%, rgba(140,197,63,0.15), transparent 70%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 grid-lines opacity-40"
      />

      {photo ? (
        <Image
          src={photo.src}
          alt={`${product.name} — ${photo.caption.toLowerCase()}`}
          fill
          sizes={sizes}
          {...(preload
            ? { preload: true }
            : eager
              ? { loading: "eager" as const }
              : null)}
          className="object-contain p-[10%] transition-transform duration-700 ease-out-expo group-hover:scale-[1.06] group-active:scale-[1.04] group-active:duration-300"
        />
      ) : (
        <ProductArt
          art={artFor(product)}
          className="absolute inset-0 size-full p-[11%] text-ink/60 transition-transform duration-700 ease-out-expo group-hover:scale-[1.06] group-active:scale-[1.04] group-active:duration-300"
        />
      )}
    </div>
  );
}
