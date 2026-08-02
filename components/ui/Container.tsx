import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** Якорь для ссылок вида /reviews#es-19. */
  id?: string;
  /** wide — для витрин и сеток, narrow — для текстовых страниц. */
  size?: "default" | "wide" | "narrow";
};

const sizes = {
  default: "max-w-[1280px]",
  wide: "max-w-[1480px]",
  narrow: "max-w-[820px]",
};

export function Container({
  children,
  className = "",
  id,
  size = "default",
}: ContainerProps) {
  return (
    <div
      id={id}
      className={`mx-auto w-full px-5 sm:px-8 lg:px-12 ${sizes[size]} ${className}`}
    >
      {children}
    </div>
  );
}
