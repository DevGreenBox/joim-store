import { StarMark } from "@/components/ui/StarMark";

/**
 * Подложка под кадром товара: графитовый градиент, фирменные линии
 * и знак водяным на них.
 *
 * Раньше за товаром светило зелёное пятно — на тёмной плитке оно читалось
 * дешёвой подсветкой, а не премиумом. Зелёный остался в линиях: акцентом,
 * а не заливкой. Знак берёт на себя роль пятна: даёт кадру центр
 * и говорит, чей это товар.
 *
 * Градиент задан числами, а не токенами: `surface-3` в светлых блоках
 * не переопределяется, и на `.section-light` подложка съехала бы.
 * Кадры товара сейчас везде на тёмном.
 */
export function FrameBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(152deg,#3a3d39_0%,#272b29_48%,#161917_100%)]" />
      {/* Знак водяным в углу: целиком, не подрезан. По центру его закрывал
          сам товар, подрезанный рамкой — читался смазанным пятном,
          а не знаком. Правый нижний угол свободен: бейдж стоит в левом
          верхнем, товар идёт по диагонали. */}
      <StarMark className="absolute right-[7%] bottom-[8%] size-[26%] text-white/[0.09]" />
      <div className="absolute inset-0 brand-lines opacity-40" />
    </div>
  );
}
