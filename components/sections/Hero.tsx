import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { StarMark } from "@/components/ui/StarMark";
import home from "@/content/pages/home.json";
import { getProduct } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";
import { getReviewsSummary } from "@/lib/reviews";
import { site } from "@/lib/site";

const { hero } = home;

/**
 * Первый экран: кадр товара во всю высоту справа, текст поверх него слева,
 * показания — стеклянными карточками над кадром, внизу полоса цифр.
 *
 * Кадр выходит за контейнер намеренно, и только он: текст, карточки
 * и полоса живут в прежней ширине макета. Так первый экран получает
 * масштаб, а сетка страницы не меняется.
 *
 * На мобильном перекрытие нечитаемо, поэтому кадр уходит из фона
 * в поток и встаёт под текстом, а карточки — под ним.
 *
 * Кадр, цена и показания берутся из каталога по слагу в `home.json`,
 * оценка и число отзывов — из того же источника, что и страница отзывов.
 */

/** «40+» → «40» и «+»: хвост CountUp не считает, он дописывается рядом. */
function split(value: string): { count: string; tail: string } {
  const match = value.match(/^([\d\s.,]+)(.*)$/);
  if (!match) return { count: "", tail: value };
  return { count: match[1].trim(), tail: match[2] };
}

export function Hero() {
  const [titleTop, titleBottom] = hero.title.split("\n");
  const product = getProduct(hero.product);
  const summary = getReviewsSummary();
  // Две карточки: ток и число запусков. Третья уже загораживает кадр.
  const cards = product ? [product.highlights[0], product.highlights[2]] : [];

  return (
    <section className="relative isolate overflow-hidden lg:pb-[75px]">
      {/* Съёмка в подкапотном пространстве во всю ширину — вместо
          вырезанного товара. Сюжет договаривает заголовок: «где сел
          аккумулятор» — это моторный отсек, а не студия.

          Поверх три завесы. Слева — плотная, под текст: без неё
          заголовок ложится на светлый бачок и провода. Снизу — в цвет
          страницы, чтобы полоса цифр стояла на сплошном. Сверху —
          лёгкая, под шапку. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
        {/* Два кадра одной съёмки, по семь секунд на каждый. Нижний лежит
            открытым, верхний уходит и возвращается по прозрачности —
            вторую анимацию заводить не нужно. Прибор на обоих посажен
            в одно место, поэтому меняется сюжет, а не композиция. */}
        <Image
          src="/images/hero/engine-2.webp"
          alt=""
          fill
          loading="eager"
          sizes="100vw"
          className="object-cover object-[64%_50%] lg:object-[50%_50%]"
        />
        <Image
          src="/images/hero/engine.webp"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-[64%_50%] animate-hero-swap lg:object-[50%_50%]"
        />
        {/* Диагональная завеса рассчитана на широкий экран: слева плотно
            под текст, справа открыто под предмет. На телефоне колонка одна
            и текст идёт поверх кадра, поэтому там завеса вертикальная. */}
        <div className="absolute inset-0 hidden bg-[linear-gradient(100deg,var(--color-void)_0%,rgba(17,19,19,0.96)_24%,rgba(17,19,19,0.82)_40%,rgba(17,19,19,0.5)_49%,rgba(17,19,19,0.16)_62%,rgba(17,19,19,0.2)_78%,rgba(17,19,19,0.5)_100%)] lg:block" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,19,19,0.94)_0%,rgba(17,19,19,0.86)_38%,rgba(17,19,19,0.5)_62%,rgba(17,19,19,0.72)_100%)] lg:hidden" />
        <div className="absolute inset-x-0 bottom-0 h-[22rem] bg-[linear-gradient(to_top,var(--color-void)_26%,rgba(17,19,19,0.55)_58%,transparent)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(17,19,19,0.8),transparent)]" />

        {/* Акцент на приборе. Затемняем всё, кроме пятна над ним:
            прибор остаётся в своей яркости, а окружение уходит вниз —
            так «ярче» получается без осветления, от которого кадр
            выцветает. Центр — 63% ширины: прибор стоит на 65% при 1280,
            на 63% при 1440 и на 60% при 1912 — кадр держится за середину
            экрана, а не за его край. Радиус взят с запасом, чтобы накрыть
            весь этот разброс. */}
        <div className="absolute inset-0 hidden bg-[radial-gradient(44%_50%_at_63%_48%,transparent_0%,rgba(17,19,19,0.2)_44%,rgba(17,19,19,0.62)_100%)] lg:block" />
      </div>

      {/* Фирменные линии поверх кадра — тише, чем на пустом фоне */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 brand-lines mask-fade-y opacity-35"
      />

      <Container size="wide" className="relative pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid gap-10 lg:min-h-[560px] lg:grid-cols-[1fr_240px] lg:gap-8">
          <div className="flex flex-col justify-center">
            <p
              className="eyebrow inline-flex items-center gap-3 animate-rise"
              style={{ animationDelay: "60ms" }}
            >
              {/* Знак вместо точки: первое, что видно на странице,
                  и это фирменная звезда, а не абстрактный кружок. */}
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/30">
                <StarMark className="size-3.5 text-accent animate-sheen" />
              </span>
              {hero.eyebrow}
            </p>

            {/* Строки разбиты переносом в контенте, поэтому text-balance
                здесь только мешал: он ломал вторую на «где сел». */}
            <h1 className="font-display mt-8 text-[clamp(2.25rem,5.2vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.04em]">
              <span
                className="block animate-rise"
                style={{ animationDelay: "140ms" }}
              >
                {titleTop}
              </span>
              <span
                className="block animate-rise text-muted"
                style={{ animationDelay: "240ms" }}
              >
                {titleBottom}
              </span>
            </h1>

            {/* Риска между заголовком и подзаголовком — та же, что открывает
                каждый раздел сайта. Здесь она ещё и отбивает крупный набор
                от мелкого: строки заголовка и лид иначе слипаются. */}
            <span
              aria-hidden="true"
              className="accent-rule mt-8 animate-rise"
              style={{ animationDelay: "300ms" }}
            />

            <p
              className="mt-6 max-w-md text-[15px] leading-relaxed text-muted animate-rise"
              style={{ animationDelay: "340ms" }}
            >
              {hero.lead}
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 animate-rise"
              style={{ animationDelay: "430ms" }}
            >
              <ButtonLink href={hero.primaryCta.href} size="lg" arrow>
                {hero.primaryCta.label}
              </ButtonLink>

              {/* Вместо чужих аватарок — своя оценка и число отзывов:
                  и то и другое посчитано по реальным покупателям. */}
              <Link
                href="/reviews"
                className="group/proof flex min-h-11 items-center gap-3 text-[13px]"
              >
                <span className="flex gap-0.5" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <svg key={star} viewBox="0 0 14 14" className="size-3.5">
                      <path
                        d="m7 1.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L7 10.2 3.6 12l.7-3.8L1.5 5.5l3.8-.5z"
                        fill="var(--color-accent)"
                      />
                    </svg>
                  ))}
                </span>
                <span className="text-muted transition-colors duration-300 group-hover/proof:text-ink">
                  <span className="num text-ink">
                    {summary.average.toFixed(1).replace(".", ",")}
                  </span>{" "}
                  по {summary.total.toLocaleString("ru-RU")}{" "}
                  {plural(summary.total, "оценке", "оценкам", "оценкам")}
                </span>
              </Link>
            </div>
          </div>

          {product ? (
            /* Показания стоят столбцом у правого края: прибор занимает
               середину кадра, и в строку карточки ложились прямо на него.
               Столбцом они встают рядом, а не поверх. */
            <div className="relative flex flex-wrap items-end justify-start gap-4 lg:flex-col lg:flex-nowrap lg:items-end lg:justify-center">
              {cards.map((item, index) => {
                const { count, tail } = split(item.value);
                return (
                  <div
                    key={item.label}
                    className="relative min-w-[150px] flex-1 rounded-2xl border border-white/12 bg-void/60 p-5 backdrop-blur-xl animate-fade lg:w-[212px] lg:flex-none lg:p-6"
                    style={{ animationDelay: `${520 + index * 90}ms` }}
                  >
                    <span
                      aria-hidden="true"
                      className="readout absolute top-4 right-5 text-[13px] leading-none text-faint"
                    >
                      ✳
                    </span>
                    <p className="num font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none font-semibold tracking-[-0.03em]">
                      {count ? <CountUp value={count} /> : null}
                      {tail}
                      {item.unit ? (
                        <span className="readout ml-1 text-[13px] font-normal text-faint">
                          {item.unit}
                        </span>
                      ) : null}
                    </p>
                    <p className="readout mt-4 text-[11px] leading-snug tracking-[0.1em] text-muted uppercase">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Подпись к кадру: что показано и почём */}
        {product ? (
          <div className="mt-10 lg:mt-2">
            <Link
              href={`/product/${product.slug}`}
              className="group/hero inline-flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted transition-colors duration-300 hover:text-ink"
            >
              <span className="readout text-[11px] tracking-[0.12em] text-accent uppercase">
                {hero.productNote}
              </span>
              <span>{product.name}</span>
              <span className="num text-ink">{formatPrice(product.price)}</span>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="size-3.5 transition-transform duration-500 ease-out-expo group-hover/hero:translate-x-1"
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
            </Link>
          </div>
        ) : null}
      </Container>

      {/* Полоса цифр по нижнему краю первого экрана */}
      <Container size="wide">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line py-7 lg:grid-cols-4 lg:py-8">
          {site.stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade"
              style={{ animationDelay: `${640 + index * 80}ms` }}
            >
              <dt className="num font-display text-[clamp(1.25rem,1.9vw,1.625rem)] leading-none font-semibold tracking-[-0.02em]">
                {/* Год основания не отсчитываем: это дата, а не показание. */}
                {stat.count === false ? (
                  stat.value
                ) : (
                  <CountUp value={stat.value} />
                )}
                <span className="text-[13px] font-medium text-faint">
                  {stat.suffix}
                </span>
              </dt>
              <dd className="readout mt-3 text-[11px] leading-snug tracking-[0.08em] text-faint uppercase">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
