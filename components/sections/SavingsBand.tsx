import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollTrack } from "@/components/ui/ScrollTrack";
import { formatPrice } from "@/lib/format";

/**
 * Во что обходится не завестись.
 *
 * Единственное место на сайте, где цена устройства стоит не сама по себе,
 * а рядом с ценой альтернативы. Полосы длиной пропорциональны суммам —
 * короткая зелёная внизу и есть весь аргумент, поэтому подписи под
 * блоком нет: она бы его пересказывала.
 */

type Item = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  note?: string;
  priceLabel: string;
  items: Item[];
  price: number;
};

export function SavingsBand({
  title,
  note,
  priceLabel,
  items,
  price,
}: Props) {
  const rows = [
    ...items.map((item) => ({ ...item, own: false })),
    { label: priceLabel, value: price, own: true },
  ];
  const max = Math.max(...rows.map((row) => row.value));

  return (
    <Container size="wide">
      <div className="rounded-2xl border border-line bg-surface p-6 lg:p-12">
        <Reveal className="max-w-xl">
          <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-tight font-semibold tracking-[-0.02em] text-balance">
            {title}
          </h2>
        </Reveal>

        {/* Полосы растут не разом, а пока блок проходит через экран:
            сумма эвакуатора успевает дочитаться раньше, чем рядом
            встаёт короткая зелёная. */}
        <ScrollTrack as="dl" className="mt-10 space-y-5 lg:mt-12">
          {rows.map((row, index) => (
            <Reveal
              key={row.label}
              delay={index * 110}
              y={12}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,15rem)_1fr_auto]"
            >
              <dt
                className={`text-[14px] leading-snug ${
                  row.own ? "text-ink" : "text-muted"
                }`}
              >
                {row.label}
              </dt>

              <span
                aria-hidden="true"
                className="order-last col-span-2 h-1.5 overflow-hidden rounded-full bg-line sm:order-none sm:col-span-1 sm:self-center"
              >
                <span
                  className={`block h-full origin-left rounded-full ${
                    row.own ? "bg-accent" : "bg-line-strong"
                  }`}
                  style={{
                    width: `${(row.value / max) * 100}%`,
                    transform: "scaleX(var(--track))",
                  }}
                />
              </span>

              <dd
                className={`num text-right text-[clamp(1rem,2.2vw,1.375rem)] leading-none font-semibold tracking-[-0.02em] ${
                  row.own ? "text-accent" : "text-ink"
                }`}
              >
                {formatPrice(row.value)}
              </dd>
            </Reveal>
          ))}
        </ScrollTrack>

        {note ? (
          <p className="mt-8 text-[13px] leading-relaxed text-faint">{note}</p>
        ) : null}
      </div>
    </Container>
  );
}
