import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";

export function Advantages() {
  return (
    <section className="border-y border-line bg-surface py-16 lg:py-32">
      <Container size="wide">
        <SectionHeading
          eyebrow={home.sections.advantages.eyebrow}
          title={home.sections.advantages.title}
        />

        {/* Ячейки были четырьмя одинаковыми прямоугольниками текста и ни на
            что не отвечали. Теперь у каждой есть свой номер крупным
            «показанием» и отклик: слева сверху вниз прочерчивается акцентная
            риска — тот же приём, что подчёркивание в меню. `active`
            продублирован специально: на телефоне hover не существует. */}
        <ul className="mt-10 grid gap-px lg:mt-14 overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
          {home.advantages.map((item, index) => (
            <Reveal
              key={item.title}
              as="li"
              delay={index * 80}
              className="group relative bg-surface p-6 transition-colors duration-500 ease-out-soft hover:bg-surface-2 active:bg-surface-2 lg:p-10"
            >
              <span
                aria-hidden="true"
                className="absolute top-0 bottom-0 left-0 w-px origin-top scale-y-0 bg-accent transition-transform duration-[600ms] ease-out-expo group-hover:scale-y-100 group-active:scale-y-100"
              />

              <p className="readout text-[clamp(1.75rem,3vw,2.25rem)] leading-none font-medium text-faint transition-colors duration-500 group-hover:text-accent group-active:text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="font-display mt-7 text-lg leading-snug font-semibold tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
                {item.text}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
