import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { getCategories } from "@/lib/catalog";
import { allPages, site } from "@/lib/site";

export function Footer() {
  const categories = getCategories();
  const year = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      className="relative mt-32 border-t border-line bg-surface"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--color-accent),transparent)] opacity-40"
      />

      <Container size="wide" className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {site.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-4 py-2 text-xs lg:min-h-0 text-muted transition-[color,border-color] duration-300 hover:border-line-strong hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Каталог">
            <h2 className="eyebrow mb-5">Каталог</h2>
            <ul className="lg:space-y-3">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/catalog?category=${category.slug}`}
                    className="flex min-h-11 items-center text-sm text-muted transition-colors duration-300 hover:text-ink lg:min-h-0"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Разделы сайта">
            <h2 className="eyebrow mb-5">Компания</h2>
            <ul className="lg:space-y-3">
              {allPages.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-sm text-muted transition-colors duration-300 hover:text-ink lg:min-h-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-5">Контакты</h2>
            <a
              href={`tel:${site.phoneHref}`}
              className="num font-display inline-flex min-h-11 items-center text-xl font-semibold tracking-[-0.01em] transition-colors duration-300 hover:text-accent lg:min-h-0"
            >
              {site.phone}
            </a>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-11 items-center transition-colors duration-300 hover:text-ink lg:min-h-0"
                >
                  {site.email}
                </a>
              </p>
              <p>{site.address}</p>
              <p>{site.hours}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Товары JOIM и их характеристики настоящие.
          </p>
          <p>
            Остальные позиции каталога, адрес и телефон — демонстрационные,
            приём заказов работает в тестовом режиме.
          </p>
        </div>
      </Container>
    </footer>
  );
}
