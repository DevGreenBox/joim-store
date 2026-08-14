import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { StoryScroll } from "@/components/ui/StoryScroll";
import home from "@/content/pages/home.json";

/**
 * Три шага до запуска. Единственное место на сайте, где показан не товар,
 * а действие: кейс, клеммы, ключ. Кадры — из съёмки заказчика.
 *
 * Заголовок отдан внутрь StoryScroll: он закрепляется вместе с шагами,
 * иначе весь прокат идёт без подписи.
 */
export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface py-16 lg:py-[75px]">
      <Container size="wide">
        <StoryScroll
          steps={home.story}
          title={home.sections.story.title}
          text={home.sections.story.text}
        />

        {/* Шаги дочитаны — дальше человеку нужно выбрать модель. Подбор
            стоит следующим блоком, кнопка ведёт прямо в него. */}
        <Reveal className="mt-10 lg:mt-14">
          <ButtonLink href={home.sections.story.cta.href} variant="outline" arrow>
            {home.sections.story.cta.label}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
