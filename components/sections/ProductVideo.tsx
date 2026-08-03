"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GOALS, track } from "@/lib/analytics";

/**
 * Промо-ролик модели.
 *
 * `preload="none"` и постер картинкой: до нажатия браузер не качает
 * ни байта видео. Ролики идут по минуте с лишним и весят мегабайты —
 * тянуть их всем подряд ради блока, до которого доскроллит меньшинство,
 * незачем.
 *
 * Плеер нативный, со штатными кнопками: свой городить не из чего —
 * у ролика есть звук и таймлайн, и системный интерфейс для этого
 * привычнее любого нарисованного.
 *
 * Вертикальные ролики (4:5) заказчик снимал под маркетплейсы. Рамку
 * держим по пропорциям самого файла, чтобы не резать подписи внутри
 * кадра: они впечатаны в видео и обрезка их покалечит.
 */

type Props = {
  title: string;
  text?: string;
  video: {
    src: string;
    poster: string;
    /** Пропорции файла: «16/9» для горизонтального, «4/5» для вертикали. */
    ratio: string;
  };
};

export function ProductVideo({ title, text, video }: Props) {
  const vertical = video.ratio === "4/5";

  return (
    <Container size="wide">
      <SectionHeading title={title} text={text} />

      <Reveal
        className={`mt-10 overflow-hidden rounded-2xl border border-line bg-surface-2 ${
          vertical ? "mx-auto max-w-[460px]" : ""
        }`}
      >
        <video
          controls
          preload="none"
          onPlay={() => track(GOALS.videoPlay, { src: video.src })}
          poster={video.poster}
          playsInline
          className="block w-full"
          style={{ aspectRatio: video.ratio }}
        >
          <source src={video.src} type="video/mp4" />
          Ваш браузер не воспроизводит видео — скачайте файл{" "}
          <a href={video.src}>по ссылке</a>.
        </video>
      </Reveal>
    </Container>
  );
}
