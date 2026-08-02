import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import home from "@/content/pages/home.json";
import { getFeatured } from "@/lib/catalog";

export function FeaturedProducts() {
  const products = getFeatured(6);

  return (
    <section className="py-16 lg:py-32">
      <Container size="wide">
        <SectionHeading
          eyebrow={home.sections.featured.eyebrow}
          title={home.sections.featured.title}
          text={home.sections.featured.text}
          action={
            <ButtonLink href="/catalog" variant="outline" arrow>
              Весь каталог
            </ButtonLink>
          }
        />

        <ul className="mt-10 grid gap-6 lg:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Reveal
              key={product.slug}
              as="li"
              delay={(index % 3) * 90}
              className="h-full"
            >
              <ProductCard product={product} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
