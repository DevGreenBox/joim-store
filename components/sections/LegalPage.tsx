import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import legal from "@/content/pages/legal.json";

/**
 * Общая раскладка правовых страниц: политика и оферта устроены одинаково —
 * заголовок, дата обновления, нумерованные разделы, реквизиты в конце.
 *
 * Реквизиты выводятся из одного места: если они разойдутся между политикой
 * и офертой, документ можно оспорить.
 */

type Doc = {
  title: string;
  lead: string;
  updated: string;
  blocks: { title: string; text: string }[];
};

export function LegalPage({ doc }: { doc: Doc }) {
  const { requisites } = legal;

  return (
    <div className="pt-12 pb-16 lg:pt-16 lg:pb-32">
      <Container size="narrow">
        <Breadcrumbs items={[{ label: doc.title }]} />

        <div className="mt-7">
          <h1 className="font-display text-[clamp(1.75rem,4.4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
            {doc.title}
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            {doc.lead}
          </p>
          <p className="readout mt-6 text-[12px] text-faint">
            Обновлено {doc.updated}
          </p>
        </div>

        <ol className="mt-14 divide-y divide-line border-y border-line">
          {doc.blocks.map((block, index) => (
            <Reveal as="li" key={block.title} y={14} className="py-8 lg:py-10">
              <div className="flex gap-5 lg:gap-8">
                <span className="readout w-6 shrink-0 text-[12px] text-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-lg leading-snug font-semibold tracking-[-0.01em]">
                    {block.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">
                    {block.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14 rounded-2xl border border-line bg-surface p-6 lg:p-9">
          <h2 className="font-display text-lg leading-snug font-semibold tracking-[-0.01em]">
            {requisites.title}
          </h2>
          <dl className="mt-6 divide-y divide-line border-t border-line">
            {requisites.items.map((item) => (
              <div
                key={item.label}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
              >
                <dt className="text-[13px] text-faint">{item.label}</dt>
                <dd
                  className={`readout text-[14px] ${
                    item.draft ? "text-faint" : "text-ink"
                  }`}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          {requisites.items.some((item) => item.draft) ? (
            <p className="mt-6 text-[13px] leading-relaxed text-danger">
              {requisites.note}
            </p>
          ) : null}
        </Reveal>
      </Container>
    </div>
  );
}
