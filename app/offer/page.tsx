import type { Metadata } from "next";

import { LegalPage } from "@/components/sections/LegalPage";
import legal from "@/content/pages/legal.json";

export const metadata: Metadata = {
  title: legal.offer.title,
  description: legal.offer.lead,
  alternates: { canonical: "/offer" },
  robots: { index: true, follow: true },
};

export default function OfferPage() {
  return <LegalPage doc={legal.offer} />;
}
