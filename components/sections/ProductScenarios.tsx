import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Scenario } from "@/lib/types";

/**
 * Сценарии применения — то, ради чего карточка становится мини-лендингом.
 *
 * Каждая ситуация подписана числом: «5000 А», «40 минут», «6 защит».
 * Число — на снимке или, если снимка нет, на его месте: геометрия
 * плиток одинаковая, и ряд не рассыпается на «с картинкой» и «без».
 * Рисовать иконку вместо кадра не стали — иконка ничего не доказывает.
 */

type Props = {
  title: string;
  items: Scenario[];
  /** Для alt: «ES-19 — мороз». */
  productName: string;
};

export function ProductScenarios({
  title,
  items,
  productName,
}: Props) {
  if (items.length === 0) return null;

  return (
    <Container size="wide">
      <SectionHeading title={title} />

      <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {items.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={(index % 2) * 90}
            y={16}
            className="flex flex-col bg-surface"
          >
            <div className="relative isolate aspect-[16/10] overflow-hidden bg-surface-2">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 brand-lines opacity-40"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                  backgroundImage:
                    "radial-gradient(58% 54% at 50% 46%, rgba(140,197,63,0.14), transparent 70%)",
                }}
              />

              {item.image ? (
                <Image
                  src={item.image}
                  alt={`${productName} — ${item.title.toLowerCase()}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-contain p-[9%]"
                />
              ) : item.readout ? (
                <p className="readout absolute inset-0 flex items-center justify-center text-[clamp(1.75rem,5vw,3rem)] leading-none font-medium tracking-[-0.03em] text-ink/70">
                  {item.readout}
                </p>
              ) : null}

              {item.image && item.readout ? (
                <p className="readout absolute bottom-4 left-4 rounded-full border border-line-strong bg-void/70 px-3 py-1.5 text-[12px] leading-none backdrop-blur-sm">
                  {item.readout}
                </p>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col p-6 lg:p-8">
              <p className="readout text-[11px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display mt-3 text-[19px] leading-snug font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Container>
  );
}
