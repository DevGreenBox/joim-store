import { Advantages } from "@/components/sections/Advantages";
import { BenefitSlider } from "@/components/sections/BenefitSlider";
import { BrandStory } from "@/components/sections/BrandStory";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { Faq } from "@/components/sections/Faq";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { GiftBand } from "@/components/sections/GiftBand";
import { Hero } from "@/components/sections/Hero";
import { LeadForm } from "@/components/sections/LeadForm";
import { ReviewsBand } from "@/components/sections/ReviewsBand";
import { TrustBand } from "@/components/sections/TrustBand";
import { getProducts } from "@/lib/catalog";

/**
 * Порядок блоков задан структурой заказчика (Joim-Store Структура
 * и правки, 17.08). Сверху вниз:
 *
 *   1. первый экран с УТП и баннером товаров, кнопка в каталог;
 *   2. отзывы — социальное доказательство до выбора;
 *   3. дополнительные УТП;
 *   4. деление на две категории;
 *   5. лента баннеров с ключевыми преимуществами;
 *   6. витрина карточек;
 *   7. доверие: видео и выход на ленту отзывов;
 *   8. идеальный подарок — развилка на частных и корпоративных;
 *   9. история компании с 2019 года;
 *  10. остались вопросы — форма.
 *
 * Квиз («Три вопроса — и модель определилась») и «Три шага до запуска»
 * заказчик просил убрать. Компоненты остались в проекте — если решение
 * пересмотрят, вернуть их сюда одна строка.
 *
 * Блок вопросов в структуре не назван, но оставлен перед формой: он
 * снимает возражения ровно там, где человек решает написать.
 */
export default function Page() {
  return (
    <>
      <Hero />
      <ReviewsBand />
      <Advantages />
      <CategoryGrid />
      <BenefitSlider />
      <FeaturedProducts />
      <TrustBand products={getProducts()} />
      <GiftBand />
      <BrandStory />
      <Faq />
      <LeadForm />
    </>
  );
}
