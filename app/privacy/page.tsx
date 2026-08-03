import type { Metadata } from "next";

import { LegalPage } from "@/components/sections/LegalPage";
import legal from "@/content/pages/legal.json";

export const metadata: Metadata = {
  title: legal.privacy.title,
  description: legal.privacy.lead,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <LegalPage doc={legal.privacy} />;
}
