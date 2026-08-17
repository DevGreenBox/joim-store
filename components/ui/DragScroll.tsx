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
const FRICTION = 0.002;
/**
 * Ниже этой скорости (px/с) лента считается остановленной. Порог высокий
 * намеренно: на низкой скорости `scrollLeft` округляется до целых, и накат
 * дотягивался шагами 1 px по десятку кадров — это читается не плавностью,
 * а подёргиванием. Лучше закончить движение, чем доползать.
 */
const STOP = 24;
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
    /**
     * Своя позиция, дробью. Читать `scrollLeft` обратно нельзя: браузер
     * округляет его до целых, и на каждом кадре терялся остаток — накат
     * шёл ступеньками вместо ровного замедления.
     */
    pos: 0,
    /** Последняя точка указателя; в прокрутку идёт раз в кадр, не на событие. */
    pointerX: 0,
    /** То же, что `dragging`, но в ref: колбэк кадра не видит свежий state. */
    held: false,
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
    s.held = true;
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLUListElement>) {
    if (!dragging) return;
    const node = event.currentTarget;
    const s = state.current;

    // Указатель шлёт события чаще, чем экран рисует кадры. Запоминаем
    // последнюю точку и пишем прокрутку один раз за кадр: лишние записи
    // заставляли браузер пересчитывать раскладку по три раза на кадр.
    s.pointerX = event.clientX;
    if (!s.frame) {
      const follow = () => {
        s.frame = 0;
        if (!s.held) return;
        s.pos = s.startLeft - (s.pointerX - s.startX);
        node.scrollLeft = s.pos;
      };
      s.frame = requestAnimationFrame(follow);
    }

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

    s.held = false;
    setDragging(false);
    try {
      if (node.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* пусто */
    }

    // Прилипание после жеста мышью не возвращаем: снова включённое,
    // оно тут же дёргает ленту к ближайшей карточке — ровно тот рывок
    // в конце наката, из-за которого прокрутка читалась неплавной.
    // Пальцем и колесом прилипание работает как раньше: до первого
    // перетаскивания мышью свойство не снималось.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || Math.abs(s.velocity) < STOP) {
      s.velocity = 0;
      return;
    }

    const max = node.scrollWidth - node.clientWidth;
    s.pos = node.scrollLeft;
    let last = performance.now();
    const coast = (now = performance.now()) => {
      const dt = Math.min((now - last) / 1000, MAX_STEP);
      last = now;
      s.velocity *= Math.pow(FRICTION, dt);
      s.pos += s.velocity * dt;

      // Упёрлись в край — гасим сразу, без отскока.
      if (s.pos <= 0 || s.pos >= max) {
        s.pos = s.pos <= 0 ? 0 : max;
        node.scrollLeft = s.pos;
        s.frame = 0;
        return;
      }

      node.scrollLeft = s.pos;
      if (Math.abs(s.velocity) < STOP) {
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
