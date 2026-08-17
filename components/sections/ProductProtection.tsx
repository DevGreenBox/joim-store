import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Защита и совместимость — два списка, которых покупатель ищет глазами,
 * а не читает подряд. Поэтому они набраны строками с разделителями,
 * без иконок и без вводного абзаца перед каждым.
 */

type Props = {
  title: string;
  text?: string;
  protections: string[];
  compatibilityTitle: string;
  compatibility: string[];
};

export function ProductProtection({
  title,
  text,
  protections,
  compatibilityTitle,
  compatibility,
}: Props) {
  if (protections.length === 0 && compatibility.length === 0) return null;

  return (
    <Container size="wide">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-2">
        {protections.length > 0 ? (
          <Reveal className="bg-surface p-6 lg:p-10">
            <h2 className="font-display text-h3 font-semibold">
              {title}
            </h2>
            {text ? (
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
                {text}
              </p>
            ) : null}

            <ul className="mt-8 divide-y divide-line border-t border-line">
              {protections.map((item) => (
                <li key={item} className="flex items-center gap-4 py-3.5">
                  <span
                    aria-hidden="true"
                    className="h-px w-4 shrink-0 bg-accent"
                  />
                  <span className="text-[14px] leading-snug text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        {compatibility.length > 0 ? (
          <Reveal delay={90} className="bg-surface p-6 lg:p-10">
            <h2 className="font-display text-h3 font-semibold">
              {compatibilityTitle}
            </h2>

            <ul className="mt-8 grid gap-x-8 border-t border-line sm:grid-cols-2">
              {compatibility.map((item, index) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 border-b border-line py-3.5"
                >
                  <span className="readout w-5 shrink-0 text-[11px] text-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] leading-snug text-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </div>
    </Container>
  );
}
