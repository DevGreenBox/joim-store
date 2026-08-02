"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * 360°-облёт вокруг устройства: сам крутится и крутится мышью.
 *
 * Рендер из библиотеки заказчика снят на чистом чёрном, а фон сайта чуть
 * светлее — поэтому кадр не ставится в рамку, а кладётся режимом
 * `mix-blend-screen`: чёрный при нём исчезает полностью, и устройство
 * висит прямо в странице, без квадратной подложки.
 *
 * Решения:
 * — файл не грузится, пока блок не подошёл к экрану: 640 КБ не должны
 *   висеть на первом экране карточки;
 * — до загрузки стоит постер весом 8 КБ, поэтому пустого места нет;
 * — перетаскивание отматывает кадры вручную. В ролике каждый кадр
 *   ключевой, поэтому перемотка попадает точно, а не в ближайший опорный;
 * — `prefers-reduced-motion` — не крутим сами, но покрутить руками даём.
 */

export function Spin360({
  video,
  poster,
  label,
}: {
  video: string;
  poster: string;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const drag = useRef<{ x: number; time: number } | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  // Грузим файл, только когда блок подошёл к экрану.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      // Браузер без наблюдателя — грузим сразу, но следующим кадром:
      // менять состояние прямо в теле эффекта нельзя.
      const frame = requestAnimationFrame(() => setSrc(video));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSrc(video);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [video]);

  function seekBy(deltaSeconds: number) {
    const node = videoRef.current;
    if (!node || !node.duration) return;
    const next = (node.currentTime + deltaSeconds) % node.duration;
    node.currentTime = next < 0 ? next + node.duration : next;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const node = videoRef.current;
    if (!node || !node.duration) return;
    node.pause();
    setScrubbing(true);
    drag.current = { x: event.clientX, time: node.currentTime };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = videoRef.current;
    const start = drag.current;
    if (!node || !start || !node.duration) return;

    // Протащить блок во всю ширину — ровно один оборот.
    const width = event.currentTarget.clientWidth || 1;
    const shift = ((event.clientX - start.x) / width) * node.duration;
    const next = (start.time - shift) % node.duration;
    node.currentTime = next < 0 ? next + node.duration : next;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    setScrubbing(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const node = videoRef.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (node && !calm) void node.play().catch(() => {});
  }

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[560px] touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ cursor: scrubbing ? "grabbing" : "grab" }}
      role="group"
      aria-label={`${label}: облёт вокруг устройства, можно крутить`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          videoRef.current?.pause();
          seekBy(0.2);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          videoRef.current?.pause();
          seekBy(-0.2);
        }
      }}
    >
      <Image
        src={poster}
        alt=""
        fill
        sizes="(min-width: 1024px) 560px, 92vw"
        className="pointer-events-none object-contain mix-blend-screen transition-opacity duration-500"
        style={{ opacity: ready ? 0 : 1 }}
      />

      {src ? (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onLoadedData={() => setReady(true)}
          className="pointer-events-none size-full object-contain mix-blend-screen transition-opacity duration-500"
          style={{ opacity: ready ? 1 : 0 }}
        />
      ) : null}

      <p className="readout pointer-events-none absolute inset-x-0 bottom-0 text-center text-[11px] text-faint">
        360° · потяните, чтобы покрутить
      </p>
    </div>
  );
}
