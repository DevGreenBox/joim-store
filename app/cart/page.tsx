import type { Metadata } from "next";

import { CartView } from "@/components/sections/CartView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Корзина",
  description: "Товары, отложенные к заказу.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  // Корзина живёт в localStorage, поэтому список товаров отдаём с сервера
  // целиком — сопоставление с содержимым корзины делает клиент.
  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide">
        <Breadcrumbs items={[{ label: "Корзина" }]} />
        <span aria-hidden="true" className="accent-rule mt-7 mb-6" />
        <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
          Корзина
        </h1>

        <CartView products={getProducts()} />
      </Container>
    </div>
  );
}
