import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="num font-display text-[clamp(4rem,14vw,9rem)] leading-none font-semibold tracking-[-0.05em] text-surface-3">
        404
      </p>
      <h1 className="font-display mt-6 text-2xl font-semibold tracking-[-0.02em] lg:text-3xl">
        Такой страницы нет
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        Возможно, товар снят с продажи или ссылка устарела. Загляните в каталог —
        скорее всего, у нас есть замена получше.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/catalog" arrow>
          В каталог
        </ButtonLink>
        <ButtonLink href="/" variant="outline">
          На главную
        </ButtonLink>
      </div>
    </Container>
  );
}
