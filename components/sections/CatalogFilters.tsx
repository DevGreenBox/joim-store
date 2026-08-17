import Form from "next/form";
import Link from "next/link";

import {
  countByCategory,
  getBrands,
  getCategories,
  priceBucketsInUse,
  type CatalogQuery,
} from "@/lib/catalog";

type Props = {
  query: CatalogQuery;
};

/**
 * Состояние каталога целиком живёт в адресной строке, а фильтры — обычные
 * ссылки. Поэтому они работают без JS, индексируются и переживают перезагрузку,
 * а ссылкой на подборку можно поделиться.
 *
 * Полоса, а не колонка. Отбирать три модели по четырём осям нечем: бренд
 * один, ценовые корзины схлопываются, и от сайдбара на 275 px оставалось
 * поле поиска, три чипа и тысяча пикселей пустоты под ними. Сетка забрала
 * освободившуюся ширину.
 */
function href(query: CatalogQuery, patch: Partial<CatalogQuery>): string {
  const params = new URLSearchParams();
  const next = { ...query, ...patch };

  for (const [key, value] of Object.entries(next)) {
    if (value) params.set(key, String(value));
  }

  const search = params.toString();
  return search ? `/catalog?${search}` : "/catalog";
}

function chipClass(active: boolean): string {
  return [
    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[13px] whitespace-nowrap",
    "transition-[color,border-color,background-color] duration-300 ease-out-soft",
    active
      ? "border-accent/45 bg-accent/10 text-accent"
      : "border-line text-muted hover:border-line-strong hover:text-ink",
  ].join(" ");
}

/** Вспомогательная ось (бренд, цена) — подписью слева от своих чипов. */
function Axis({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="eyebrow">{title}</span>
      {children}
    </div>
  );
}

export function CatalogFilters({ query }: Props) {
  const categories = getCategories();
  const brands = getBrands();
  const buckets = priceBucketsInUse();
  // Ось показываем, только если ей есть что отбирать: один бренд
  // и одна ценовая корзина ничего не фильтруют.
  const showBrands = brands.length > 1;
  const showPrice = buckets.length > 1;
  const isFiltered = Boolean(
    query.category || query.brand || query.price || query.q,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href={href(query, { category: undefined })}
              className={chipClass(!query.category)}
            >
              Все модели
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={href(query, { category: category.slug })}
                className={chipClass(query.category === category.slug)}
              >
                {category.shortName}
                <span className="num text-[11px] opacity-60">
                  {countByCategory(category.slug)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Form action="/catalog" className="relative lg:w-72">
          {/* Поиск не должен сбрасывать выбранные фильтры */}
          {query.category ? (
            <input type="hidden" name="category" value={query.category} />
          ) : null}
          {query.brand ? (
            <input type="hidden" name="brand" value={query.brand} />
          ) : null}
          {query.price ? (
            <input type="hidden" name="price" value={query.price} />
          ) : null}

          <label htmlFor="catalog-search" className="sr-only">
            Поиск по каталогу
          </label>
          <input
            id="catalog-search"
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Модель, бренд, артикул"
            className="h-11 w-full rounded-full border border-line bg-surface pr-12 pl-5 text-[16px] text-ink transition-colors duration-300 outline-none placeholder:text-faint focus:border-line-strong sm:text-sm"
          />
          <button
            type="submit"
            aria-label="Найти"
            className="absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4">
              <circle
                cx="9"
                cy="9"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m13.5 13.5 3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </Form>
      </div>

      {showBrands || showPrice || isFiltered ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {showBrands ? (
            <Axis title="Бренд">
              <Link
                href={href(query, { brand: undefined })}
                className={chipClass(!query.brand)}
              >
                Все
              </Link>
              {brands.map((brand) => (
                <Link
                  key={brand}
                  href={href(query, { brand })}
                  className={chipClass(query.brand === brand)}
                >
                  {brand}
                </Link>
              ))}
            </Axis>
          ) : null}

          {showPrice ? (
            <Axis title="Цена">
              <Link
                href={href(query, { price: undefined })}
                className={chipClass(!query.price)}
              >
                Любая
              </Link>
              {buckets.map((bucket) => (
                <Link
                  key={bucket.id}
                  href={href(query, { price: bucket.id })}
                  className={chipClass(query.price === bucket.id)}
                >
                  {bucket.label}
                </Link>
              ))}
            </Axis>
          ) : null}

          {isFiltered ? (
            <Link
              href="/catalog"
              className="inline-flex min-h-11 items-center gap-2 text-[13px] text-faint transition-colors duration-300 hover:text-ink"
            >
              <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3">
                <path
                  d="m3 3 8 8M11 3l-8 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              Сбросить
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { href as catalogHref, chipClass as catalogChipClass };
