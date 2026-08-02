import Form from "next/form";
import Link from "next/link";

import {
  PRICE_BUCKETS,
  countByCategory,
  getBrands,
  getCategories,
  type CatalogQuery,
} from "@/lib/catalog";

type Props = {
  query: CatalogQuery;
};

/**
 * Состояние каталога целиком живёт в адресной строке, а фильтры — обычные
 * ссылки. Поэтому они работают без JS, индексируются и переживают перезагрузку,
 * а ссылкой на подборку можно поделиться.
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
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] whitespace-nowrap",
    "transition-[color,border-color,background-color] duration-300 ease-out-soft",
    active
      ? "border-accent/45 bg-accent/10 text-accent"
      : "border-line text-muted hover:border-line-strong hover:text-ink",
  ].join(" ");
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-6 first:border-0 first:pt-0">
      <h2 className="eyebrow mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function CatalogFilters({ query }: Props) {
  const categories = getCategories();
  const brands = getBrands();
  const isFiltered = Boolean(
    query.category || query.brand || query.price || query.q,
  );

  return (
    <div className="flex flex-col gap-6">
      <Form action="/catalog" className="relative">
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
        {query.sort ? (
          <input type="hidden" name="sort" value={query.sort} />
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
          className="h-11 w-full rounded-full border border-line bg-surface pr-11 pl-5 text-[16px] text-ink transition-colors duration-300 outline-none placeholder:text-faint focus:border-line-strong sm:text-sm"
        />
        <button
          type="submit"
          aria-label="Найти"
          className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-ink"
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

      <Group title="Категория">
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          <li>
            <Link
              href={href(query, { category: undefined })}
              className={`lg:w-full lg:justify-between ${chipClass(!query.category)}`}
            >
              Все категории
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={href(query, { category: category.slug })}
                className={`lg:w-full lg:justify-between ${chipClass(
                  query.category === category.slug,
                )}`}
              >
                {category.shortName}
                <span className="num text-[11px] opacity-60">
                  {countByCategory(category.slug)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Бренд">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={href(query, { brand: undefined })}
              className={chipClass(!query.brand)}
            >
              Все
            </Link>
          </li>
          {brands.map((brand) => (
            <li key={brand}>
              <Link
                href={href(query, { brand })}
                className={chipClass(query.brand === brand)}
              >
                {brand}
              </Link>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Цена">
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          <li>
            <Link
              href={href(query, { price: undefined })}
              className={`lg:w-full ${chipClass(!query.price)}`}
            >
              Любая
            </Link>
          </li>
          {PRICE_BUCKETS.map((bucket) => (
            <li key={bucket.id}>
              <Link
                href={href(query, { price: bucket.id })}
                className={`lg:w-full ${chipClass(query.price === bucket.id)}`}
              >
                {bucket.label}
              </Link>
            </li>
          ))}
        </ul>
      </Group>

      {isFiltered ? (
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 self-start text-[13px] text-faint transition-colors duration-300 hover:text-ink"
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
          Сбросить фильтры
        </Link>
      ) : null}
    </div>
  );
}

export { href as catalogHref, chipClass as catalogChipClass };
