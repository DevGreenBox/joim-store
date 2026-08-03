import { Advantages } from "@/components/sections/Advantages";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { Faq } from "@/components/sections/Faq";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { LeadForm } from "@/components/sections/LeadForm";
import { ModelPicker } from "@/components/sections/ModelPicker";

export default function Page() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <HowItWorks />
      <Advantages />
      <ModelPicker />
      <CategoryGrid />
      <Faq />
      <LeadForm />
    </>
  );
}
