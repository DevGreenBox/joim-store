import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductArt } from "@/components/ui/ProductArt";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";
import { countByCategory, getCategories, getProducts } from "@/lib/catalog";
import { plural } from "@/lib/format";

export function CategoryGrid() {
  const categories = getCategories();
  const total = getProducts().length;

  return (
    <section className="py-16 lg:py-32">
      <Container size="wide">
        <SectionHeading
          eyebrow={home.sections.categories.eyebrow}
          title={home.sections.categories.title}
          text={home.sections.categories.text || undefined}
          action={
            <ButtonLink href="/catalog" variant="outline" arrow>
              Весь каталог
            </ButtonLink>
          }
        />

        <div className="mt-10 grid gap-px lg:mt-14 overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const count = countByCategory(category.slug);
            return (
              <Reveal
                key={category.slug}
                delay={index * 70}
                className="group relative bg-surface"
              >
                <Link
                  href={`/catalog?category=${category.slug}`}
                  className="flex h-full flex-col gap-5 p-6 transition-colors duration-500 ease-out-soft hover:bg-surface-2 active:bg-surface-2 active:duration-200 lg:p-9"
                >
                  <div className="flex items-start justify-between gap-4">
                    <ProductArt
                      art={category.art}
                      className="-ml-2 size-20 text-ink/45 transition-[color,transform] duration-700 ease-out-expo group-hover:-translate-y-1 group-hover:text-ink/80 group-active:-translate-y-1 group-active:text-ink/80"
                    />
                    <span className="num text-[11px] tracking-wide text-faint">
                      {count} {plural(count, "товар", "товара", "товаров")}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <p className="eyebrow mb-3">{category.tagline}</p>
                    <h3 className="font-display text-xl leading-snug font-semibold tracking-[-0.01em]">
                      {category.name}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-muted">
                      {category.description}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="inline-flex items-center gap-2 text-[13px] text-faint transition-colors duration-300 group-hover:text-ink group-active:text-ink"
                  >
                    Смотреть
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-active:translate-x-1"
                    >
                      <path
                        d="M2 8h11M9 4l4 4-4 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Link>
              </Reveal>
            );
          })}

          {/* Категорий меньше, чем колонок, — последняя ячейка иначе осталась
              бы дырой в сетке. Здесь она работает выходом в общий каталог. */}
          <Reveal
            delay={categories.length * 70}
            className="group relative bg-surface"
          >
            <Link
              href="/catalog"
              className="flex h-full min-h-[220px] flex-col justify-end gap-5 p-6 transition-colors duration-500 ease-out-soft hover:bg-surface-2 active:bg-surface-2 active:duration-200 lg:p-9"
            >
              <p className="eyebrow">Всё сразу</p>
              <h3 className="font-display text-xl leading-snug font-semibold tracking-[-0.01em]">
                Весь каталог
              </h3>
              <p className="text-[13px] leading-relaxed text-muted">
                {total} {plural(total, "позиция", "позиции", "позиций")}{" "}
                с фильтрами по бренду, цене и категории.
              </p>
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-2 text-[13px] text-faint transition-colors duration-300 group-hover:text-ink group-active:text-ink"
              >
                Открыть
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-active:translate-x-1"
                >
                  <path
                    d="M2 8h11M9 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
