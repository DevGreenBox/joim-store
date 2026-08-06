import type { Metadata } from "next";

import { CheckoutForm } from "@/components/sections/CheckoutForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Оформление заказа",
  description: "Подтверждение заказа и способа получения.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="pt-10 pb-16 lg:pt-16 lg:pb-[75px]">
      <Container size="wide">
        <Breadcrumbs
          items={[{ label: "Корзина", href: "/cart" }, { label: "Оформление" }]}
        />
        <h1 className="font-display mt-7 text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em]">
          Оформление заказа
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Заполните контакты — менеджер подтвердит наличие и срок доставки.
        </p>

        <CheckoutForm products={getProducts()} />
      </Container>
    </div>
  );
}
