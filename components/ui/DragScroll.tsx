"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Лента, которую тянут мышью: зажал, повёл, отпустил — она докатывается
 * сама и встаёт у края.
 *
 * Пальцем и колесом всё это умеет сам браузер, поэтому трогаем только
 * мышь (`pointerType === "mouse"`). На касание не подписываемся вовсе:
 * перехват испортил бы нативную прокрутку, которая работает лучше любой
 * самописной.
 *
 * Прилипание на время жеста снимаем: `scroll-snap` тянет ленту к своей
 * ближайшей карточке и гасит инерцию на первом же кадре. Возвращаем его,
 * когда лента остановилась, — тогда она мягко доводится до карточки,
 * а не замирает на половине.
 *
 * По бокам — растворение в фон страницы. Оно гаснет у того края, за
 * которым уже ничего нет: полоса, которая не темнеет, и есть сообщение
 * «дальше не листается».
 */

/**
 * Затухание скорости за секунду. Считается от времени, а не от числа
 * кадров: на экране 120 Гц кадров вдвое больше, и «доля за кадр» гасила
 * накат вдвое быстрее — лента вела себя по-разному на разных мониторах.
 */
const FRICTION = 0.024;
/** Ниже этой скорости (px/с) считаем, что лента встала. */
const STOP = 7;
/** Больше этого шаг времени не берём: вкладка была в фоне. */
const MAX_STEP = 0.05;

type Props = {
  children: ReactNode;
  /** Классы самой ленты — она же элемент прокрутки. */
  className?: string;
  "aria-label"?: string;
};

export function DragScroll({ children, className = "", ...rest }: Props) {
  const ref = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Всё, что меняется покадрово, держим в ref: перерисовка на каждый
  // пиксель жеста не нужна и стоила бы дороже самой прокрутки.
  const state = useRef({
    startX: 0,
    startLeft: 0,
    lastX: 0,
    lastAt: 0,
    velocity: 0,
    frame: 0,
    snap: "",
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const s = state.current;

    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      setAtStart(node.scrollLeft <= 1);
      setAtEnd(node.scrollLeft >= max - 1);
    };

    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
      cancelAnimationFrame(s.frame);
    };
  }, []);

  function stopCoasting() {
    cancelAnimationFrame(state.current.frame);
    state.current.frame = 0;
  }

  function restoreSnap(node: HTMLUListElement) {
    node.style.scrollSnapType = state.current.snap;
  }

  function onPointerDown(event: React.PointerEvent<HTMLUListElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const node = event.currentTarget;

    stopCoasting();
    // Захват держит жест, даже если курсор ушёл за пределы ленты. Бросает,
    // когда указателя с таким id уже нет, — тогда просто тянем без захвата.
    try {
      node.setPointerCapture(event.pointerId);
    } catch {
      /* пусто */
    }

    const s = state.current;
    s.snap = node.style.scrollSnapType;
    node.style.scrollSnapType = "none";
    s.startX = event.clientX;
    s.startLeft = node.scrollLeft;
    s.lastX = event.clientX;
    s.lastAt = event.timeStamp;
    s.velocity = 0;
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLUListElement>) {
    if (!dragging) return;
    const node = event.currentTarget;
    const s = state.current;

    node.scrollLeft = s.startLeft - (event.clientX - s.startX);

    // Скорость берём по последнему отрезку, а не за весь жест: важно,
    // с какой руки ленту отпустили, а не как её вели вначале.
    const dt = event.timeStamp - s.lastAt;
    if (dt > 0) {
      const perSecond = ((s.lastX - event.clientX) / dt) * 1000;
      // Сглаживаем: одиночный рывок мыши иначе улетает в инерцию.
      s.velocity = s.velocity * 0.4 + perSecond * 0.6;
      s.lastX = event.clientX;
      s.lastAt = event.timeStamp;
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLUListElement>) {
    if (!dragging) return;
    const node = event.currentTarget;
    const s = state.current;

    setDragging(false);
    try {
      if (node.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* пусто */
    }

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || Math.abs(s.velocity) < STOP) {
      restoreSnap(node);
      return;
    }

    const max = node.scrollWidth - node.clientWidth;
    let last = performance.now();
    const coast = (now = performance.now()) => {
      const dt = Math.min((now - last) / 1000, MAX_STEP);
      last = now;
      s.velocity *= Math.pow(FRICTION, dt);
      const next = node.scrollLeft + s.velocity * dt;

      // Упёрлись в край — гасим сразу, без отскока.
      if (next <= 0 || next >= max) {
        node.scrollLeft = next <= 0 ? 0 : max;
        restoreSnap(node);
        s.frame = 0;
        return;
      }

      node.scrollLeft = next;
      if (Math.abs(s.velocity) < STOP) {
        restoreSnap(node);
        s.frame = 0;
        return;
      }
      s.frame = requestAnimationFrame(coast);
    };
    s.frame = requestAnimationFrame(coast);
  }

  return (
    <div className="relative">
      <ul
        ref={ref}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        // Родное перетаскивание картинки браузером перехватывает жест:
        // вместо ленты с места трогается полупрозрачная копия снимка.
        // Событие всплывает, поэтому глушим его на самой ленте.
        onDragStart={(event) => event.preventDefault()}
        className={`${className} [&_img]:[-webkit-user-drag:none] ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        {...rest}
      >
        {children}
      </ul>

      {/* Края: то, за чем ещё есть лента, темнеет; упёршийся край — нет. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-[linear-gradient(to_right,var(--color-void),transparent)] transition-opacity duration-500 ease-out-soft sm:w-12 lg:w-16 ${
          atStart ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-[linear-gradient(to_left,var(--color-void),transparent)] transition-opacity duration-500 ease-out-soft sm:w-12 lg:w-16 ${
          atEnd ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
