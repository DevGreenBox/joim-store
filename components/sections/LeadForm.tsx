"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import lead from "@/content/pages/lead.json";
import { submitLead, type LeadState } from "@/lib/actions";
import { GOALS, track } from "@/lib/analytics";
import { site } from "@/lib/site";

/**
 * Анкета «остались вопросы» в конце страниц.
 *
 * Раньше на этом месте стояла полоса «Три устройства, все в наличии»
 * с кнопкой в каталог. Человек, дочитавший страницу до конца, уже был
 * в каталоге — ему предлагали вернуться туда же. Анкета отвечает
 * на то, с чем он на самом деле остался: с вопросом.
 *
 * Обязательных полей два — имя и телефон. Тема и сам вопрос
 * необязательны: чем длиннее анкета, тем реже её заполняют,
 * а перезвонить можно и без темы.
 *
 * Скрытым полем уходит адрес страницы: по нему видно, что человек
 * читал перед тем, как спросить, и разговор начинается не с нуля.
 */

/**
 * Поля обведены фирменным зелёным, а не общей серой линией: анкета —
 * единственное место на странице, где от человека ждут действия, и рамка
 * должна показывать, куда нажимать.
 *
 * Три ступени по прозрачности: покой 30%, наведение 55%, фокус — полный
 * цвет с кольцом. Сплошной зелёный в покое на восьми рамках сразу
 * превращает анкету в светофор; на трети он читается контуром, а не
 * заливкой, и оставляет запас для фокуса.
 */
const fieldClass =
  "h-12 w-full rounded-xl border border-accent/30 bg-void/40 px-4 text-[16px] text-ink sm:text-[15px] " +
  "transition-colors duration-300 outline-none placeholder:text-faint hover:border-accent/55 " +
  "focus:border-accent focus:ring-1 focus:ring-accent/40";

export function LeadForm() {
  const pathname = usePathname();
  const [state, formAction, isPending] = useActionState<LeadState, FormData>(
    submitLead,
    { status: "idle" },
  );

  useEffect(() => {
    if (state.status === "success") track(GOALS.leadSent, { page: pathname });
  }, [state.status, pathname]);

  const errors = state.status === "error" ? state.errors : {};

  return (
    <section className="pb-16 lg:pt-[75px] lg:pb-[75px]">
      <Container size="wide">
        {/* Контур плашки тем же зелёным, только вдвое тише полей: он обводит
            весь блок, и на равной силе спорил бы с рамками внутри. */}
        <Reveal className="relative isolate overflow-hidden rounded-3xl border border-accent/25 bg-surface px-6 py-14 lg:px-16 lg:py-20">
          {/* Кадр из съёмки подложкой. Предмет стоит в левой трети — там же,
              где заголовок, — поэтому поверх идут две завесы: диагональная
              под текст и полей, и общая. Кадр остаётся фактурой, а не
              вторым сюжетом: контраст заголовка на нём 12:1, полей — 7:1. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <Image
              src="/images/hero/lead.webp"
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 1200px"
              className="object-cover object-[42%_12%]"
            />
            {/* Завеса плотная там, где текст и поля, и отпускает кадр
                внизу слева, где стоит предмет. Раньше она шла ровно
                и глушила снимок целиком. */}
            <div className="absolute inset-0 hidden bg-[linear-gradient(168deg,rgba(17,19,19,0.96)_0%,rgba(17,19,19,0.9)_34%,rgba(17,19,19,0.62)_58%,rgba(17,19,19,0.4)_82%,rgba(17,19,19,0.34)_100%)] lg:block" />
            <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,transparent_0%,transparent_40%,rgba(17,19,19,0.45)_64%,rgba(17,19,19,0.7)_100%)] lg:block" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,19,19,0.88),rgba(17,19,19,0.93))] lg:hidden" />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 brand-lines opacity-40"
          />

          {state.status === "success" ? (
            <div className="mx-auto max-w-lg text-center">
              <span
                aria-hidden="true"
                className="mx-auto grid size-14 place-items-center rounded-full border border-accent/40 bg-accent/10"
              >
                <svg viewBox="0 0 24 24" className="size-6">
                  <path
                    d="m6 12.5 4 4 8-9"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="font-display mt-7 text-2xl font-semibold tracking-[-0.02em]">
                {lead.done.title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                {lead.done.text}
              </p>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
              <div className="lg:pt-2">
                <h2 className="font-display text-h2 font-semibold text-balance">
                  {lead.title}
                </h2>
                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
                  {lead.text}
                </p>

                <p className="mt-8 text-[13px] text-faint">
                  {lead.callInstead}{" "}
                  <a
                    href={`tel:${site.phoneHref}`}
                    className="num text-ink transition-colors duration-300 hover:text-accent"
                  >
                    {site.phone}
                  </a>
                </p>
              </div>

              {/* noValidate: браузер иначе перехватывает сабмит своим
                  пузырём на языке интерфейса ОС, и наши русские ошибки
                  ниже недостижимы. `required` оставлен — он озвучивается
                  скринридером, проверку делает сервер. */}
              <form action={formAction} noValidate className="grid gap-4">
                <input type="hidden" name="page" value={pathname} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="lead-name"
                      className="mb-2 block text-[13px] font-medium text-muted"
                    >
                      {lead.fields.name}
                    </label>
                    <input
                      id="lead-name"
                      name="name"
                      autoComplete="name"
                      placeholder={lead.fields.namePlaceholder}
                      aria-invalid={errors.name ? true : undefined}
                      className={`${fieldClass} ${errors.name ? "border-danger/60" : ""}`}
                      required
                    />
                    {errors.name ? (
                      <p className="mt-2 text-[12px] text-danger">
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="lead-phone"
                      className="mb-2 block text-[13px] font-medium text-muted"
                    >
                      {lead.fields.phone}
                    </label>
                    <input
                      id="lead-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={lead.fields.phonePlaceholder}
                      aria-invalid={errors.phone ? true : undefined}
                      className={`${fieldClass} ${errors.phone ? "border-danger/60" : ""}`}
                      required
                    />
                    {errors.phone ? (
                      <p className="mt-2 text-[12px] text-danger">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lead-topic"
                    className="mb-2 block text-[13px] font-medium text-muted"
                  >
                    {lead.fields.topic}
                  </label>
                  <select
                    id="lead-topic"
                    name="topic"
                    defaultValue={lead.topics[0]}
                    className={fieldClass}
                  >
                    {lead.topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lead-question"
                    className="mb-2 block text-[13px] font-medium text-muted"
                  >
                    {lead.fields.question}
                  </label>
                  <textarea
                    id="lead-question"
                    name="question"
                    rows={3}
                    placeholder={lead.fields.questionPlaceholder}
                    className="w-full resize-y rounded-xl border border-accent/30 bg-void/40 p-4 text-[16px] leading-relaxed text-ink transition-colors duration-300 outline-none placeholder:text-faint hover:border-accent/55 focus:border-accent focus:ring-1 focus:ring-accent/40 sm:text-[15px]"
                  />
                </div>

                <Checkbox name="consent">
                  {lead.consent} —{" "}
                  <Link
                    href="/privacy"
                    className="text-ink underline underline-offset-2 transition-opacity duration-300 hover:opacity-70"
                  >
                    условия
                  </Link>
                </Checkbox>
                {errors.consent ? (
                  <p className="text-[12px] text-danger">{errors.consent}</p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="mt-2 justify-self-start"
                  arrow={!isPending}
                >
                  {isPending ? lead.sending : lead.submit}
                </Button>
              </form>
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
