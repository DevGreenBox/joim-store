"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // На боевом сайте сюда подключается отправка в систему мониторинга.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] lg:text-3xl">
        Что-то пошло не так
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        Страница не загрузилась. Попробуйте обновить — если повторится,
        позвоните нам, оформим заказ по телефону.
      </p>
      {error.digest ? (
        <p className="num mt-3 text-[12px] text-faint">Код: {error.digest}</p>
      ) : null}
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Попробовать снова</Button>
        <ButtonLink href="/" variant="outline">
          На главную
        </ButtonLink>
      </div>
    </Container>
  );
}
