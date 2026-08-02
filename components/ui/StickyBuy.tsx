"use client";

import { useEffect, useState } from "react";

import { AddToCart } from "@/components/ui/AddToCart";
import { formatPrice } from "@/lib/format";

/**
 * Нижняя панель покупки — только на мобильном.
 *
 * На десктопе блок с ценой и кнопкой закреплён сбоку и виден всегда:
 * там для этого есть вторая колонка. На телефоне колонка одна, и цена
 * с кнопкой уезжают вверх, как только начинаешь читать характеристики.
 * Поэтому на узком экране они возвращаются снизу — это отдельное решение
 * для мобильного, а не сжатая копия десктопного макета.
 *
 * Панель показывается, когда основной блок покупки ушёл вверх, и уезжает
 * вниз, как только начинается подвал, — чтобы не перекрывать его ссылки.
 */

type Props = {
  slug: string;
  name: string;
  price: number;
  inStock: boolean;
  /** id основного блока покупки, за которым следим. */
  anchorId: string;
};

export function StickyBuy({ slug, name, price, inStock, anchorId }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Панели нет на десктопе — там и считать нечего.
    const narrow = window.matchMedia("(max-width: 1023px)");

    let frame = 0;

    function measure() {
      frame = 0;
      const anchor = document.getElementById(anchorId);
      if (!anchor) return;
      const footer = document.getElementById("site-footer");

      // Блок покупки полностью ушёл вверх — и подвал ещё не начался,
      // иначе панель накрыла бы его ссылки.
      const passed = anchor.getBoundingClientRect().bottom < 0;
      const atFooter = footer
        ? footer.getBoundingClientRect().top < window.innerHeight
        : false;

      setVisible(passed && !atFooter);
    }

    function schedule() {
      // Геометрию читаем раз в кадр: скролл сам по себе ничего не считает.
      if (!frame) frame = requestAnimationFrame(measure);
    }

    function attach() {
      if (narrow.matches) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });
        schedule();
      } else {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        setVisible(false);
      }
    }

    attach();
    narrow.addEventListener("change", attach);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      narrow.removeEventListener("change", attach);
    };
  }, [anchorId]);

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-void/90 backdrop-blur-xl transition-transform duration-500 ease-out-expo lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-4 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-muted">{name}</p>
          <p className="num font-display text-lg leading-tight font-semibold tracking-[-0.01em]">
            {formatPrice(price)}
          </p>
        </div>
        <AddToCart slug={slug} inStock={inStock} variant="full" />
      </div>
    </div>
  );
}
