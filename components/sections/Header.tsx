"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/lib/cart";
import { nav, site } from "@/lib/site";

function CartLink({ onNavigate }: { onNavigate?: () => void }) {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      onClick={onNavigate}
      aria-label={`Корзина${ready && count ? `, товаров: ${count}` : ""}`}
      className="group/cart relative grid size-10 place-items-center rounded-full border border-line text-ink transition-[border-color,background-color] duration-300 ease-out-soft hover:border-line-strong hover:bg-white/[0.05]"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px]">
        <path
          d="M3 4h2l1.6 8.2a1.5 1.5 0 0 0 1.5 1.2h6.3a1.5 1.5 0 0 0 1.5-1.2L17 6.5H5.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8.5" cy="16.5" r="1.2" fill="currentColor" />
        <circle cx="14.5" cy="16.5" r="1.2" fill="currentColor" />
      </svg>

      {/* Счётчик появляется только после чтения localStorage — без скачка при гидратации */}
      <span
        aria-hidden="true"
        className="num absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] leading-[18px] font-semibold text-void transition-[opacity,transform] duration-300 ease-out-expo"
        style={{
          opacity: ready && count > 0 ? 1 : 0,
          transform: ready && count > 0 ? "scale(1)" : "scale(0.6)",
        }}
      >
        {count}
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  /** Возвращать фокус на кнопку — да, но не когда меню закрылось переходом. */
  const restoreFocus = useRef(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Пока открыто меню: страница под ним не скроллится, фокус уходит внутрь
  // панели и по закрытии возвращается на кнопку — иначе с клавиатуры
  // пользователь оказывается в начале документа.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    restoreFocus.current = true;
    panelRef.current?.querySelector("a")?.focus();
    const toggle = toggleRef.current;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      if (restoreFocus.current) toggle?.focus();
    };
  }, [open]);

  const isActive = (item: (typeof nav)[number]) => {
    if (pathname.startsWith(item.href)) return true;
    return ("also" in item ? item.also : []).some((branch) =>
      pathname.startsWith(branch),
    );
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-(--header-h) transition-[background-color,border-color,backdrop-filter] duration-500 ease-out-soft ${
          scrolled || open
            ? "border-b border-line bg-void/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <Container size="wide" className="flex h-full items-center gap-6">
          <Logo />

          <nav
            aria-label="Основная навигация"
            className="ml-auto hidden lg:block"
          >
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item) ? "page" : undefined}
                    className={`group/nav relative inline-flex h-10 items-center rounded-full px-4 text-sm transition-colors duration-300 ${
                      isActive(item)
                        ? "text-ink"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 bottom-1.5 h-px origin-left bg-accent transition-transform duration-[400ms] ease-out-expo ${
                        isActive(item)
                          ? "scale-x-100"
                          : "scale-x-0 group-hover/nav:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-3">
            <a
              href={`tel:${site.phoneHref}`}
              className="num hidden text-sm font-medium text-ink transition-colors duration-300 hover:text-accent xl:inline"
            >
              {site.phone}
            </a>

            <CartLink />

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              className="grid size-10 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-line-strong lg:hidden"
            >
              <span className="relative block h-3 w-[18px]">
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-transform duration-[400ms] ease-out-expo ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-full bg-current transition-transform duration-[400ms] ease-out-expo ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </Container>
      </header>

      {/* Мобильное меню — снаружи <header>: backdrop-filter на шапке создаёт
          содержащий блок, и панель внутри неё схлопнулась бы в её высоту. */}
      <div
        ref={panelRef}
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-(--header-h) bottom-0 z-40 overflow-y-auto border-t border-line bg-void/95 backdrop-blur-xl lg:hidden"
      >
        <Container className="flex min-h-full flex-col py-10">
          <ul className="flex flex-col">
            {nav.map((item, index) => (
              <li
                key={item.href}
                className="border-b border-line"
                style={{
                  animation: open
                    ? `rise 0.5s var(--ease-out-expo) ${index * 55}ms both`
                    : undefined,
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    restoreFocus.current = false;
                    setOpen(false);
                  }}
                  className="font-display flex items-center justify-between py-5 text-2xl font-semibold tracking-[-0.02em]"
                >
                  {item.label}
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="size-4 text-faint"
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
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-10">
            <p className="eyebrow mb-4">Связаться</p>
            <a
              href={`tel:${site.phoneHref}`}
              className="num font-display block text-2xl font-semibold tracking-[-0.02em]"
            >
              {site.phone}
            </a>
            <p className="mt-2 text-sm text-muted">{site.address}</p>
            <p className="text-sm text-muted">{site.hours}</p>
          </div>
        </Container>
      </div>
    </>
  );
}
