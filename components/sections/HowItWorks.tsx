import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StoryScroll } from "@/components/ui/StoryScroll";
import home from "@/content/pages/home.json";

/**
 * Три шага до запуска. Единственное место на сайте, где показан не товар,
 * а действие: кейс, клеммы, ключ. Кадры — из съёмки заказчика.
 */
export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface py-16 lg:py-32">
      <Container size="wide">
        <SectionHeading
          title={home.sections.story.title}
          text={home.sections.story.text}
        />

        <StoryScroll steps={home.story} />
      </Container>
    </section>
  );
}
