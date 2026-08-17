import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ProductImage } from "@/components/ui/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Сравнение моделей одной категории.
 *
 * На карточке товара это полезнее блока «из этой же категории»: при двух
 * пусковых устройствах тот показывал одну сиротливую плитку в сетке
 * на три колонки, а вопрос у покупателя ровно один — ES-19 или ES-29.
 *
 * Строки, где значения совпадают, приглушены: взгляд сразу падает
 * на то, чем модели действительно отличаются.
 */

/** Характеристики, которые есть у всех моделей, в порядке первой из них. */
function sharedLabels(products: Product[]): string[] {
  const [first, ...rest] = products;
  return first.specs
    .map((spec) => spec.label)
    .filter((label) =>
      rest.every((product) => product.specs.some((s) => s.label === label)),
    );
}

function valueOf(product: Product, label: string): string {
  return product.specs.find((spec) => spec.label === label)?.value ?? "—";
}

/** Содержимое шапки столбца: одинаковое со ссылкой и без неё. */
function head(product: Product, current: boolean) {
  return (
    <>
      <span className="block size-16 overflow-hidden rounded-xl border border-line transition-colors duration-300 group-hover/model:border-accent/50">
        <ProductImage product={product} sizes="64px" className="size-full" />
      </span>

      <span
        className={`font-display mt-4 block text-base leading-snug font-semibold tracking-[-0.01em] transition-colors duration-300 ${
          current ? "" : "group-hover/model:text-accent"
        }`}
      >
        {product.name}
      </span>

      <span className="num mt-2 block text-[15px] font-medium">
        {formatPrice(product.price)}
      </span>

      <span
        className={`readout mt-3 block text-[11px] ${
          current ? "text-accent" : "text-faint"
        }`}
      >
        {current ? "вы смотрите эту" : "открыть карточку"}
      </span>
    </>
  );
}

export function ModelCompare({
  products,
  currentSlug,
  title,
}: {
  products: Product[];
  currentSlug: string;
  title: string;
}) {
  const labels = sharedLabels(products);

  return (
    <Container size="wide">
      <h2 className="font-display text-h2 font-semibold">
        {title}
      </h2>

      <Reveal className="mt-10 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <caption className="sr-only">
            Сравнение характеристик: {products.map((p) => p.name).join(", ")}
          </caption>

          <thead>
            <tr>
              <th scope="col" className="w-[30%] bg-surface p-5 align-top lg:p-7">
                <span className="eyebrow">Сравнение</span>
              </th>

              {products.map((product) => {
                const current = product.slug === currentSlug;
                return (
                  <th
                    key={product.slug}
                    scope="col"
                    className={`border-l border-line p-5 align-top lg:p-7 ${
                      current ? "bg-surface-2" : "bg-surface"
                    }`}
                  >
                    {/* Ссылкой работает вся шапка столбца — кадр, имя, цена
                        и подпись. Раньше нажималось только имя: в кадр и в цену
                        человек целится первым делом, а они не отвечали.
                        У открытой модели ссылки нет, вести некуда. */}
                    {current ? (
                      <span className="block">{head(product, current)}</span>
                    ) : (
                      <Link
                        href={`/product/${product.slug}`}
                        className="group/model block"
                      >
                        {head(product, current)}
                      </Link>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {labels.map((label) => {
              const values = products.map((product) => valueOf(product, label));
              const same = values.every((value) => value === values[0]);

              return (
                <tr key={label} className="border-t border-line">
                  <th
                    scope="row"
                    className={`bg-surface p-5 text-[13px] font-normal lg:px-7 ${
                      same ? "text-faint" : "text-muted"
                    }`}
                  >
                    {label}
                  </th>

                  {products.map((product, index) => {
                    const current = product.slug === currentSlug;
                    return (
                      <td
                        key={product.slug}
                        className={`border-l border-line p-5 text-[14px] lg:px-7 ${
                          current ? "bg-surface-2" : "bg-surface"
                        } ${same ? "text-faint" : "text-ink"} ${
                          values[index].length <= 18 ? "readout" : ""
                        }`}
                      >
                        {values[index]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Reveal>
    </Container>
  );
}
