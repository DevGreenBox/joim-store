import { Container } from "@/components/ui/Container";
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
    <section className="border-y border-line bg-surface py-16 lg:py-24">
      <Container size="wide">
        <StoryScroll
          steps={home.story}
          title={home.sections.story.title}
          text={home.sections.story.text}
        />
      </Container>
    </section>
  );
}
