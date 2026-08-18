import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-faint">
        <li>
          <Link href="/" className="inline-flex min-h-6 items-center transition-colors duration-300 hover:text-ink">
            Главная
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-faint/60">
              /
            </span>
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-6 items-center transition-colors duration-300 hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-muted">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
