import Image from "next/image";

import { reviewMedia, type Review } from "@/lib/reviews";

/**
 * Вложения отзыва миниатюрами — для мест, где карточка узкая и кадр
 * во всю ширину её бы перевесил: блок на главной, список на карточке
 * товара.
 *
 * Ряд стоит под текстом, перед подписью, — там же, где вложения
 * в письме или сообщении: сначала сказанное, потом приложенное.
 * Над звёздами, как на эскизе, они бы спорили с оценкой за первый
 * взгляд, а оценка в отзыве главнее.
 *
 * Кадров показываем четыре, дальше счётчик: пятая миниатюра в ряду
 * на 280 px уже не помещается, а «+2» занимает столько же места
 * и говорит больше.
 *
 * Миниатюры не кликаются: вся карточка и так открывает отзыв целиком,
 * а вторая цель внутри первой — лишний выбор на ровном месте.
 */

/** Больше не влезает в ряд на узкой карточке. */
const SHOWN = 4;

export function ReviewThumbs({ review }: { review: Review }) {
  const media = reviewMedia(review);
  if (media.length === 0) return null;

  const shown = media.slice(0, SHOWN);
  const rest = media.length - shown.length;

  return (
    <ul
      className="mt-5 flex flex-wrap gap-2"
      aria-label={`Вложений: ${media.length}`}
    >
      {shown.map((item) => (
        <li key={item.src}>
          <span className="relative block size-11 overflow-hidden rounded-lg border border-line bg-void">
            <Image
              src={item.type === "photo" ? item.src : item.poster}
              alt=""
              aria-hidden="true"
              fill
              sizes="44px"
              className="object-cover"
            />
            {item.type === "video" ? (
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center bg-void/45 text-ink"
              >
                <svg viewBox="0 0 24 24" className="size-3.5">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </span>
            ) : null}
          </span>
        </li>
      ))}

      {rest > 0 ? (
        <li>
          <span className="readout grid size-11 place-items-center rounded-lg border border-line text-[12px] text-faint">
            +{rest}
          </span>
        </li>
      ) : null}
    </ul>
  );
}
