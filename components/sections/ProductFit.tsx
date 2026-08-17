import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/lib/types";

/**
 * «Кому эта модель» — и, что важнее, кому она избыточна.
 *
 * Вторая половина блока написана против продажи текущей карточки.
 * Магазин, который говорит «здесь переплачивать не за что», отвечает
 * на вопрос, с которым покупатель иначе уходит сравнивать в другое место.
 * Стоит прямо перед таблицей сравнения — дальше он идёт смотреть цифры.
 */

type Props = {
  title: string;
  whoLabel: string;
  skipLabel: string;
  fits: Product["fits"];
};

export function ProductFit({
  title,
  whoLabel,
  skipLabel,
  fits,
}: Props) {
  return (
    <Container size="wide">
      <Reveal>
        <h2 className="font-display text-h2 font-semibold">
          {title}
        </h2>
      </Reveal>

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-2">
        <Reveal className="bg-surface p-6 lg:p-10">
          <p className="readout text-[11px] tracking-[0.12em] text-accent uppercase">
            {whoLabel}
          </p>
          <p className="mt-5 text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-ink text-balance">
            {fits.who}
          </p>
        </Reveal>

        {fits.skip ? (
          <Reveal delay={90} className="bg-surface p-6 lg:p-10">
            <p className="readout text-[11px] tracking-[0.12em] text-faint uppercase">
              {skipLabel}
            </p>
            <p className="mt-5 text-[clamp(1rem,1.8vw,1.25rem)] leading-relaxed text-muted text-balance">
              {fits.skip}
            </p>
          </Reveal>
        ) : null}
      </div>
    </Container>
  );
}
