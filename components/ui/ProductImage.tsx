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
  /**
   * Переход на второй ракурс при наведении — для плиток каталога.
   * В корзине и на странице отзывов картинка одна и меняться не должна.
   */
  hoverSwap?: boolean;
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
  hoverSwap = false,
  className = "",
}: Props) {
  const photo = product.images[0];
  const hover =
    hoverSwap && product.hoverImage !== undefined
      ? product.images[product.hoverImage]
      : undefined;

  // Оба слоя увеличиваются одинаково, а меняется только прозрачность:
  // так наезд читается одним движением, а не двумя разными.
  //
  // В переходе именно `scale`, а не `transform`: Tailwind 4 задаёт масштаб
  // отдельным свойством, и со списком `transform` наезд срабатывал скачком.
  // drop-shadow берёт силуэт из альфы, поэтому тень повторяет корпус,
  // а не рамку кадра. Две ступени: близкая держит контур, дальняя
  // отрывает предмет от плашки.
  const zoom =
    "object-contain p-[10%] transition-[opacity,scale] duration-700 ease-out-expo " +
    "[filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.55))_drop-shadow(0_2px_4px_rgba(0,0,0,0.4))] " +
    "group-hover:scale-[1.06] group-active:scale-[1.04] group-active:duration-300";
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
        className="absolute inset-0 -z-10 brand-lines opacity-40"
      />

      {/* Контактная тень: предмет вырезан по контуру и без неё висит
          в воздухе. Эллипс у нижней трети — там, где он касался бы
          поверхности. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[14%] bottom-[9%] -z-10 h-[12%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.62),transparent)] blur-[6px]"
      />

      {photo ? (
        <>
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
            className={`${zoom} ${
              hover ? "group-hover:opacity-0 group-active:opacity-0" : ""
            }`}
          />
          {hover ? (
            // Пустой alt: ракурс тот же товар, и второе описание подряд
            // экранной читалке ничего не добавляет. Грузится лениво —
            // на первый экран эти кадры не нужны.
            <Image
              src={hover.src}
              alt=""
              fill
              sizes={sizes}
              className={`${zoom} opacity-0 group-hover:opacity-100 group-active:opacity-100`}
            />
          ) : null}
        </>
      ) : (
        <ProductArt
          art={artFor(product)}
          className="absolute inset-0 size-full p-[11%] text-ink/60 transition-transform duration-700 ease-out-expo group-hover:scale-[1.06] group-active:scale-[1.04] group-active:duration-300"
        />
      )}
    </div>
  );
}
