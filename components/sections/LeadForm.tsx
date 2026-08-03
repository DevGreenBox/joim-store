"use client";

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

const fieldClass =
  "h-12 w-full rounded-xl border border-line bg-void/40 px-4 text-[16px] text-ink sm:text-[15px] " +
  "transition-colors duration-300 outline-none placeholder:text-faint focus:border-line-strong";

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
    <section className="pb-16 lg:pb-32">
      <Container size="wide">
        <Reveal className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-1/2 -z-10 h-[560px] animate-drift bg-[radial-gradient(closest-side,rgba(140,197,63,0.14),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-50"
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
                <h2 className="font-display text-[clamp(1.75rem,4.2vw,3rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
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

              <form action={formAction} className="grid gap-4">
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
                    className="w-full resize-y rounded-xl border border-line bg-void/40 p-4 text-[16px] leading-relaxed text-ink transition-colors duration-300 outline-none placeholder:text-faint focus:border-line-strong sm:text-[15px]"
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
