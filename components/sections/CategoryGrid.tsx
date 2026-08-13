import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarMark } from "@/components/ui/StarMark";
import home from "@/content/pages/home.json";
import { getCategories } from "@/lib/catalog";

/**
 * Витрина категорий: две крупные карточки, в каждой текст слева
 * и кадр товара справа.
 *
 * Было три узкие ячейки с векторной иконкой, третья — заглушка «весь
 * каталог», потому что категорий меньше, чем колонок. Выход в каталог
 * и так стоит кнопкой в заголовке блока, а иконка вместо снимка ничего
 * не продаёт. Категорий две — карточек две, и в каждой настоящий товар.
 *
 * Светлый блок в тёмной странице — чередование по просьбе заказчика.
 * Плашки внутри взяты светлее фона: у пусковых зелёный фирменный
 * подмешан к светло-серому, у ухода — чистый белый. Тёмной карточки,
 * как на референсе, здесь нет: заказчик просил оттенки посветлее.
 */
export function CategoryGrid() {
  const categories = getCategories();

  // Подложки плашек. Обе светлее графита страницы и темнее фона блока:
  // на #f5f5f7 белая плашка почти не читается. Первая — фирменный зелёный,
  // подмешанный к Apple Light Gray, вторая — тот же серый с уходом
  // в графит. Тёмный текст на обеих даёт больше 12:1.
  const tone = ["bg-[#e9efdf]", "bg-[#e7eaea]"];

  return (
    <section className="section-light py-16 lg:py-[75px]">
      <Container size="wide">
        <SectionHeading
          title={home.sections.categories.title}
          text={home.sections.categories.text || undefined}
          action={
            <ButtonLink href="/catalog" variant="outline" arrow>
              Весь каталог
            </ButtonLink>
          }
        />

        <div className="mt-10 grid gap-5 lg:mt-14 lg:grid-cols-2 lg:gap-6">
          {categories.map((category, index) => (
            <Reveal key={category.slug} delay={index * 90}>
              <Link
                href={`/catalog/${category.slug}`}
                className={`group relative isolate grid h-full overflow-hidden rounded-2xl border border-line ${tone[index % tone.length]} transition-shadow duration-500 ease-out-soft hover:shadow-[0_18px_44px_rgba(29,33,31,0.12)] sm:grid-cols-[1fr_42%]`}
              >
                {/* Знак подложкой, как в кадрах товара, только на светлом */}
                <StarMark className="pointer-events-none absolute -right-[8%] -bottom-[30%] -z-10 size-[62%] rotate-[-14deg] text-ink/[0.05]" />

                <div className="flex flex-col p-6 lg:p-9">
                  <p className="eyebrow">{category.tagline}</p>
                  <h3 className="font-display mt-4 text-[clamp(1.375rem,2.4vw,1.875rem)] leading-[1.12] font-semibold tracking-[-0.02em] text-balance">
                    {category.name}
                  </h3>
                  <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
                    {category.description}
                  </p>

                  {/* Кнопка не button и не ссылка: вся карточка уже ссылка,
                      вложенная сюда бы не прошла по разметке. `mt-auto`
                      прижимает её к низу — описания разной длины, иначе
                      кнопки в соседних плашках стоят на разной высоте. */}
                  <span aria-hidden="true" className="mt-auto pt-8 lg:pt-10">
                    <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-[13px] transition-colors duration-300 group-hover:border-accent group-hover:text-accent group-active:border-accent group-active:text-accent">
                      {category.cta}
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
                  </span>
                </div>

                {/* Кадр прижат к правому краю и подрезан плашкой. На телефоне
                    колонка одна: снимок уходит под текст полосой, иначе
                    на 390 px текстовой колонке остаётся треть ширины. */}
                <div className="relative h-40 sm:h-auto">
                  <Image
                    src={category.cover.src}
                    alt={category.cover.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 42vw, 21vw"
                    className="object-contain p-5 transition-[scale] duration-700 ease-out-expo [filter:drop-shadow(0_16px_26px_rgba(29,33,31,0.28))] group-hover:scale-[1.05] group-active:scale-[1.04] group-active:duration-300 sm:p-7"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
