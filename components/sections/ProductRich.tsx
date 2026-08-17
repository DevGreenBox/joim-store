import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/ui/CountUp";
import { FrameBackdrop } from "@/components/ui/FrameBackdrop";
import { PosterVideo } from "@/components/ui/PosterVideo";
import { Reveal } from "@/components/ui/Reveal";
import type { RichBlock } from "@/lib/types";

/**
 * Рич-контент карточки: блоки, которые заказчик набирает под каждый товар
 * сам (структура 17.08, п. 4.2).
 *
 * Раздел рисует то, что лежит в данных, и ничего не знает про конкретный
 * товар. Добавить материал — дописать объект в `rich` у товара; порядок
 * блоков на странице равен порядку в списке.
 *
 * Отступ между блоками держится общим правилом страницы — 150 px
 * на десктопе, 64 на телефоне.
 */

function Banner({ block }: { block: Extract<RichBlock, { type: "banner" }> }) {
  return (
    <Container size="wide">
      <Reveal
        className={`relative isolate grid overflow-hidden rounded-3xl border border-line lg:grid-cols-2 ${
          block.light ? "section-light" : "bg-surface"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
        />

        <div
          className={`flex flex-col justify-center p-8 lg:p-14 ${
            block.flip ? "lg:order-2" : ""
          }`}
        >
          <span aria-hidden="true" className="gauge accent-rule mb-6" />
          <h2 className="font-display text-h2 font-semibold text-balance">
            {block.title}
          </h2>
          {block.text ? (
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              {block.text}
            </p>
          ) : null}
        </div>

        <div
          className={`relative ${
            block.scene
              ? "min-h-[300px] lg:min-h-[440px]"
              : "min-h-[260px] lg:min-h-[380px]"
          }`}
        >
          <Image
            src={block.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className={
              block.scene ? "object-cover" : "object-contain p-8 lg:p-12"
            }
          />
        </div>
      </Reveal>
    </Container>
  );
}

function Text({ block }: { block: Extract<RichBlock, { type: "text" }> }) {
  return (
    <Container size="wide">
      <Reveal className="max-w-2xl">
        <span aria-hidden="true" className="gauge accent-rule mb-6" />
        <h2 className="font-display text-h2 font-semibold text-balance">
          {block.title}
        </h2>
        {block.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="mt-5 text-[15px] leading-relaxed text-muted"
          >
            {paragraph}
          </p>
        ))}
      </Reveal>
    </Container>
  );
}

function Media({ block }: { block: Extract<RichBlock, { type: "media" }> }) {
  return (
    <Container size="wide">
      <Reveal className="relative isolate overflow-hidden rounded-3xl border border-line">
        {block.video ? (
          <PosterVideo
            src={block.video.src}
            poster={block.video.poster}
            ratio={block.video.ratio}
          />
        ) : block.image ? (
          <div className="relative aspect-[16/9]">
            {block.scene ? null : <FrameBackdrop />}
            <Image
              src={block.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 1023px) 100vw, 1400px"
              className={block.scene ? "object-cover" : "object-contain p-[6%]"}
            />
          </div>
        ) : null}
      </Reveal>

      {block.caption ? (
        <Reveal className="mt-4">
          <p className="readout text-[12px] text-faint">{block.caption}</p>
        </Reveal>
      ) : null}
    </Container>
  );
}

function Specs({ block }: { block: Extract<RichBlock, { type: "specs" }> }) {
  return (
    <Container size="wide">
      {block.title ? (
        <Reveal>
          <span aria-hidden="true" className="gauge accent-rule mb-6" />
          <h2 className="font-display mb-10 text-h2 font-semibold">
            {block.title}
          </h2>
        </Reveal>
      ) : null}

      <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {block.items.map((item, index) => (
          <Reveal
            key={item.label}
            delay={index * 70}
            className="bg-surface p-6 lg:p-8"
          >
            <dt className="num font-display text-h2 font-semibold">
              <CountUp value={item.value} />
              {item.unit ? (
                <span className="readout ml-1.5 text-[13px] font-normal text-faint">
                  {item.unit}
                </span>
              ) : null}
            </dt>
            <dd className="mt-4 text-[13px] leading-snug text-muted">
              {item.label}
            </dd>
          </Reveal>
        ))}
      </dl>
    </Container>
  );
}

function Columns({ block }: { block: Extract<RichBlock, { type: "columns" }> }) {
  return (
    <Container size="wide">
      {block.title ? (
        <Reveal>
          <span aria-hidden="true" className="gauge accent-rule mb-6" />
          <h2 className="font-display mb-10 text-h2 font-semibold">
            {block.title}
          </h2>
        </Reveal>
      ) : null}

      <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {block.items.map((item, index) => (
          <Reveal
            as="li"
            key={item.title}
            delay={index * 70}
            className="bg-surface p-6 lg:p-9"
          >
            <p className="readout text-[11px] text-faint">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display mt-5 text-lg leading-snug font-semibold tracking-[-0.01em]">
              {item.title}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">
              {item.text}
            </p>
          </Reveal>
        ))}
      </ul>
    </Container>
  );
}

export function ProductRich({ blocks }: { blocks?: RichBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block, index) => (
        <div key={index} className="mt-16 lg:mt-[150px]">
          {block.type === "banner" ? <Banner block={block} /> : null}
          {block.type === "text" ? <Text block={block} /> : null}
          {block.type === "media" ? <Media block={block} /> : null}
          {block.type === "specs" ? <Specs block={block} /> : null}
          {block.type === "columns" ? <Columns block={block} /> : null}
        </div>
      ))}
    </>
  );
}
