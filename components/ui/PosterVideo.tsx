"use client";

import { useRef, useState } from "react";

import { GOALS, track } from "@/lib/analytics";

/**
 * Стартовая громкость. Ролики сняты громко, и на полной человек
 * первым делом ищет, чем это выключить. Дальше он крутит ползунок
 * сам — своё значение браузер запоминает на сеанс.
 */
const START_VOLUME = 0.2;

type Props = {
  src: string;
  poster: string;
  /** Соотношение кадра. Не задано — блок сам держит габарит. */
  ratio?: string;
  className?: string;
};

/**
 * Ролик, который до первого нажатия выглядит кадром, а не проигрывателем.
 *
 * Нативная панель со шкалой и таймером «0:00» лежала поверх постера
 * и перекрывала подписи внутри кадра — на трёх роликах подряд это
 * читалось как три сломанных плеера. Панель появляется вместе
 * с воспроизведением; до него сверху лежит своя кнопка.
 *
 * Кнопка настоящая, а не div: с клавиатуры ролик запускается пробелом,
 * скринридер читает подпись.
 */
export function PosterVideo({ src, poster, ratio, className = "" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function start() {
    const node = ref.current;
    if (!node) return;
    setStarted(true);
    node.controls = true;
    node.volume = START_VOLUME;
    node.play();
    track(GOALS.videoPlay, { src });
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        preload="none"
        poster={poster}
        playsInline
        className={`block w-full ${className}`}
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        <source src={src} type="video/mp4" />
        Ваш браузер не воспроизводит видео — скачайте файл{" "}
        <a href={src}>по ссылке</a>.
      </video>

      {started ? null : (
        <button
          type="button"
          onClick={start}
          aria-label="Смотреть ролик"
          className="group/play absolute inset-0 grid place-items-center transition-colors duration-500 hover:bg-void/25 focus-visible:bg-void/25"
        >
          <span className="grid size-16 place-items-center rounded-full border border-ink/25 bg-void/55 backdrop-blur-sm transition-[transform,background-color,border-color] duration-500 ease-out-expo group-hover/play:scale-110 group-hover/play:border-accent group-hover/play:bg-void/70">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 size-6">
              <path
                d="M8 5.5v13l11-6.5z"
                fill="currentColor"
                className="text-ink transition-colors duration-500 group-hover/play:text-accent"
              />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
