import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 " +
  "rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-out-soft " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-void hover:bg-white hover:shadow-[0_10px_40px_-12px_rgba(242,244,247,0.45)]",
  outline:
    "border border-line-strong text-ink hover:border-ink/60 hover:bg-white/[0.04]",
  ghost: "text-muted hover:text-ink hover:bg-white/[0.04]",
};

const sizes: Record<Size, string> = {
  // 44 px до `lg:` — ниже этого палец промахивается; на десктопе указатель
  // точнее, и кнопка садится до 40.
  sm: "h-11 px-4 text-[13px] lg:h-10",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[15px]",
};

type BaseProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Стрелка, которая уезжает вправо при наведении. */
  arrow?: boolean;
};

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow ? (
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1"
        >
          <path
            d="M2 8h11M9 4l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  arrow,
  ...rest
}: BaseProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  size = "md",
  className = "",
  arrow,
  ...rest
}: BaseProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}
