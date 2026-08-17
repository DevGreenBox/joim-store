"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * 360°-облёт вокруг устройства: сам крутится и крутится рукой.
 *
 * Раньше здесь перематывалось видео: на каждое движение мыши ставился
 * `currentTime`. Перемотка в браузере асинхронная, а событий приходит
 * по шестьдесят в секунду — кадры не успевали, и вращение шло рывками.
 *
 * Теперь кадры лежат отдельными картинками, загружаются один раз
 * и рисуются в canvas. Смена кадра — это одна отрисовка, она мгновенная
 * и не зависит от декодера. Отсюда и плавность.
 *
 * Движение живёт в кольце `angle` (в кадрах) со скоростью и трением:
 * — тянут — угол идёт за пальцем один в один;
 * — отпустили — вращение продолжается по набранной скорости и гаснет;
 * — молчат три секунды — включается медленный автооблёт;
 * — коснулись снова — автооблёт выключается без скачка, с той же точки.
 *
 * Кадры сняты на чистом чёрном, а фон страницы чуть светлее, поэтому
 * canvas кладётся режимом `mix-blend-screen`: чёрное исчезает, и предмет
 * висит прямо в странице, без квадратной подложки.
 *
 * `prefers-reduced-motion` — сами не крутим, руками покрутить даём.
 */

/** Сколько ширины блока нужно протащить на полный оборот. */
const TURN = 1.1;
/**
 * Трение: доля скорости, остающаяся за секунду. Всё движение считается
 * от времени, а не от числа кадров: на экране 120 Гц кадров вдвое больше,
 * и «доля за кадр» гасила вращение вдвое быстрее, чем на 60 Гц.
 */
const FRICTION = 0.024;
/** Скорость автооблёта, кадров в секунду. */
const IDLE_SPEED = 8.4;
/** Пауза перед автооблётом, мс. */
const IDLE_AFTER = 3000;
/** Ниже этого скорость считаем нулевой, кадров в секунду. */
const STILL = 0.25;
/** Больше этого шаг времени не берём: вкладка была в фоне. */
const MAX_STEP = 0.05;

export function Spin360({
  frames,
  poster,
  label,
}: {
  /** Кадры облёта по порядку, от первого до последнего. */
  frames: string[];
  poster: string;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const images = useRef<HTMLImageElement[]>([]);
  const angle = useRef(0);
  const speed = useRef(0);
  const drawn = useRef(-1);
  const idleAt = useRef(0);
  const pointer = useRef<{ x: number; y: number; at: number } | null>(null);

  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [held, setHeld] = useState(false);

  // Грузим кадры, только когда блок подошёл к экрану.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setLoad(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Загрузка кадров. Первый ждём обязательно, остальные — как придут:
  // крутить можно уже с частью набора, недостающие подставит ближайший.
  useEffect(() => {
    if (!load) return;
    let alive = true;

    const list = frames.map((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
      return img;
    });
    images.current = list;

    const first = list[0];
    const done = () => {
      if (alive) setReady(true);
    };
    if (first.complete) done();
    else first.addEventListener("load", done, { once: true });

    return () => {
      alive = false;
    };
  }, [load, frames]);

  // Один цикл на всё: и инерция, и автооблёт, и отрисовка.
  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();

    // Больше исходных 720 px холст не берём: растягивать кадр вверх —
    // это мыло без единого лишнего пикселя резкости.
    function size() {
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const side = Math.min(Math.round(box.width * dpr), 720);
      canvas.width = side;
      canvas.height = side;
      drawn.current = -1;
    }

    function tick(now = performance.now()) {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, MAX_STEP);
      last = now;

      const total = images.current.length;
      if (!total || !canvas || !ctx) return;

      if (!pointer.current) {
        if (Math.abs(speed.current) > STILL) {
          angle.current += speed.current * dt;
          speed.current *= Math.pow(FRICTION, dt);
        } else {
          speed.current = 0;
          // Автооблёт после паузы. Он не «включается» рывком: скорость
          // та же, что осталась бы от медленного вращения.
          if (!calm && now - idleAt.current > IDLE_AFTER) {
            angle.current += IDLE_SPEED * dt;
          }
        }
      }

      const index = ((Math.round(angle.current) % total) + total) % total;
      if (index === drawn.current) return;

      // Кадр ещё не долетел — оставляем предыдущий, а не мигаем пустотой.
      const img = images.current[index];
      if (!img?.complete || !img.naturalWidth) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawn.current = index;
    }

    size();
    idleAt.current = performance.now();
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", size);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", size);
    };
  }, [ready]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!ready) return;
    pointer.current = { x: event.clientX, y: event.clientY, at: performance.now() };
    speed.current = 0;
    setHeld(true);
    // Захват держит жест за пределами блока. Бросает, если указателя
    // с таким id уже нет — тогда крутим без захвата.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* пусто */
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const from = pointer.current;
    if (!from) return;

    // Направление жеста не задано жёстко: в поворот идёт и горизонтальное,
    // и вертикальное движение. Раньше считался только `clientX`, и предмет
    // не отзывался, пока рука не шла точно вбок — вести приходилось
    // по линейке. Теперь берут как удобно: вбок, вниз, по диагонали.
    const box = event.currentTarget;
    const reach = (box.clientWidth || 1) * TURN;
    const step =
      ((event.clientX - from.x + (event.clientY - from.y)) / reach) *
      images.current.length;

    angle.current -= step;

    // Скорость — в кадрах в секунду: после отпускания вращение
    // продолжается ровно с той быстротой, с какой вели рукой,
    // и не зависит от частоты экрана.
    const now = performance.now();
    const dt = Math.max(now - from.at, 1) / 1000;
    speed.current = -step / dt;

    pointer.current = { x: event.clientX, y: event.clientY, at: now };
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointer.current) return;
    pointer.current = null;
    idleAt.current = performance.now();
    setHeld(false);
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      /* пусто */
    }
  }

  function nudge(direction: number) {
    speed.current = direction * 54;
    idleAt.current = performance.now();
  }

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[560px] touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      // Колесо крутит так же, как перетаскивание: рука уже на мыши.
      onWheel={(event) => {
        if (!ready) return;
        angle.current += Math.sign(event.deltaY) * 0.8;
        idleAt.current = performance.now();
      }}
      style={{ cursor: held ? "grabbing" : "grab" }}
      role="group"
      aria-label={`${label}: облёт вокруг устройства, можно крутить`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          nudge(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          nudge(-1);
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

      <canvas
        ref={canvasRef}
        className="pointer-events-none size-full mix-blend-screen transition-opacity duration-500"
        style={{ opacity: ready ? 1 : 0 }}
      />

      <p className="readout pointer-events-none absolute inset-x-0 bottom-0 text-center text-[11px] text-faint">
        360° · потяните, чтобы покрутить
      </p>
    </div>
  );
}
