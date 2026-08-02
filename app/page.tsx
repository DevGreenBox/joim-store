import { Advantages } from "@/components/sections/Advantages";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/sections/Faq";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Advantages />
      <Process />
      <CategoryGrid />
      <Faq />
      <CtaBand />
    </>
  );
}
