import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { StarMark } from "@/components/ui/StarMark";
import home from "@/content/pages/home.json";
import { getProducts } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";
import { getReviewsSummary } from "@/lib/reviews";
import { site } from "@/lib/site";

const { hero } = home;

/**
 * Первый экран: УТП слева, фирменный баннер со всей линейкой справа.
 *
 * Структура заказчика (17.08) требует именно баннер с разными товарами.
 * До этого здесь стояла съёмка подкапотного пространства с одним
 * прибором: сильный кадр, но он обещал одну модель, а магазин продаёт
 * три. Съёмка не пропала — она держит блок преимуществ, подложку анкеты
 * и сценарии в карточках.
 *
 * Баннер собран из пакшотов одной съёмки: свет и ракурс у всех трёх
 * совпадают, поэтому линейка читается семьёй, а не коллажем. Приборы
 * стоят уступом — тот, что впереди, крупнее и перекрывает соседей.
 *
 * Каждый прибор — ссылка со своей подписью и ценой: первый экран
 * не только обещает, но и открывает путь в конкретную карточку.
 */

/**
 * Раскладка линейки — долями от рамки баннера, а не пикселями:
 * композиция должна пережить любую ширину колонки.
 *
 * Размер задан ВЫСОТОЙ. Приборы вытянутые (564×1200), и от ширины они
 * вырастают выше рамки и обрезаются: 44% ширины при таких пропорциях
 * дают полторы высоты баннера.
 *
 * Порядок в разметке — задний, задний, передний: перекрытие держится
 * порядком в потоке, без z-index на каждом.
 */
const LAYOUT = [
  // ES-29 — слева и глубже
  { left: "2%", bottom: "10%", height: "78%", tilt: "-4deg" },
  // PVC-1 — справа, узкий и высокий
  { left: "76%", bottom: "8%", height: "86%", tilt: "3deg" },
  // ES-19 — по центру и впереди
  { left: "34%", bottom: "2%", height: "96%", tilt: "0deg" },
];

export function Hero() {
  const [titleTop, titleBottom] = hero.title.split("\n");
  const summary = getReviewsSummary();
  // Порядок для показа: сначала хит, потом старшая модель, потом пылесос.
  const all = getProducts();
  const order = ["joim-easy-start-es29", "joim-pvc1", "joim-easy-start-es19"];
  const line = order
    .map((slug) => all.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<typeof product> => !!product);

  return (
    <section className="relative isolate overflow-hidden lg:pb-[75px]">
      {/* Подложка — шлифованный графит: свет справа сверху, левая половина
          в тени под заголовком. Ни знака, ни сетки линий здесь больше нет:
          вместе с приборами и заголовком они давали кашу, а фон первого
          экрана должен молчать. Знак и линии остались в блоках ниже, где
          над ними ничего не стоит. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20">
        <Image
          src="/images/hero/plate.webp"
          alt=""
          fill
          sizes="100vw"
          preload
          className="object-cover object-center"
        />
        {/* Ровная завеса поверх металла. В присланном кадре светлая часть
            доходит до rgb 93, и серый текст на ней даёт 3,1:1 — ниже нормы
            4,5:1. Под шапкой и подписями линейки это как раз самая светлая
            зона. Завеса опускает верх до ~60 и оставляет и фактуру,
            и направление света. */}
        <div className="absolute inset-0 bg-void/45" />

        {/* Нижняя завеса сводит кадр в цвет страницы: без неё полоса цифр
            стоит на видимом стыке. */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(to_top,var(--color-void),transparent)]" />
      </div>

      <Container size="wide" className="relative pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid gap-12 lg:min-h-[560px] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
          <div className="flex flex-col justify-center">
            <p
              className="eyebrow inline-flex items-center gap-3 animate-rise"
              style={{ animationDelay: "60ms" }}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/30">
                <StarMark className="size-3.5 text-accent animate-sheen" />
              </span>
              {hero.eyebrow}
            </p>

            <h1 className="font-display mt-8 text-display font-semibold">
              <span className="block animate-rise" style={{ animationDelay: "140ms" }}>
                {titleTop}
              </span>
              <span
                className="block animate-rise text-muted"
                style={{ animationDelay: "240ms" }}
              >
                {titleBottom}
              </span>
            </h1>

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
                  {summary.total}{" "}
                  {plural(summary.total, "отзыв", "отзыва", "отзывов")}
                </span>
              </Link>
            </div>
          </div>

          {/* Баннер линейки */}
          <div className="animate-fade" style={{ animationDelay: "360ms" }}>
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[4/3]">
              {/* Общая тень под линейкой: без неё приборы висят в воздухе */}
              <span
                aria-hidden="true"
                className="absolute inset-x-[8%] bottom-[2%] h-[8%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.7),transparent)] blur-[10px]"
              />

              {line.map((product, index) => {
                const spot = LAYOUT[index];
                return (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    aria-label={product.name}
                    className="group/item absolute block"
                    style={{ left: spot.left, bottom: spot.bottom, height: spot.height }}
                  >
                    <span
                      className="block h-full transition-transform duration-700 ease-out-expo group-hover/item:-translate-y-2"
                      style={{ transform: `rotate(${spot.tilt})` }}
                    >
                      <Image
                        src={product.images[0].src}
                        alt=""
                        width={564}
                        height={1200}
                        sizes="(max-width: 1023px) 30vw, 16vw"
                        className="h-full w-auto [filter:drop-shadow(0_26px_34px_rgba(0,0,0,0.6))_drop-shadow(0_4px_8px_rgba(0,0,0,0.5))]"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Легенда постоянная, а не по наведению: на телефоне наведения
                нет, а линейку надо назвать. Порядок здесь каталожный —
                от младшей модели к пылесосу, не тот, в котором приборы
                расставлены по глубине. */}
            <ul className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-5">
              {all.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/product/${product.slug}`}
                    className="group/name block min-h-11"
                  >
                    <span className="readout block text-[11px] leading-snug text-faint transition-colors duration-300 group-hover/name:text-accent">
                      {product.name.replace(/^JOIM\s*/, "")}
                    </span>
                    <span className="num mt-1.5 block text-[13px] text-ink">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
              <dt className="num font-display text-fig-sm font-semibold">
                {stat.count === false ? stat.value : <CountUp value={stat.value} />}
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
