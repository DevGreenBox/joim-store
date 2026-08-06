import { Container } from "@/components/ui/Container";
import { ModelPickerForm } from "@/components/ui/ModelPickerForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";
import { getProduct } from "@/lib/catalog";
import type { Product } from "@/lib/types";

/**
 * Секция подбора модели. Данные — из `home.json`, товары — из каталога:
 * цена и наличие в результате всегда те же, что в карточке.
 */
export function ModelPicker() {
  const slugs = Object.keys(home.picker.results);
  const products = slugs
    .map((slug) => getProduct(slug))
    .filter((product): product is Product => Boolean(product));

  // Подбор из одной модели смысла не имеет — секция просто не выводится.
  if (products.length < 2) return null;

  return (
    <section id="podbor" className="scroll-mt-24 py-16 lg:py-[75px]">
      <Container size="wide">
        <SectionHeading
          title={home.sections.picker.title}
          text={home.sections.picker.text}
        />

        <ModelPickerForm
          questions={home.picker.questions}
          scale={home.picker.scale}
          results={home.picker.results}
          products={[products[0], products[1]]}
        />
      </Container>
    </section>
  );
}
