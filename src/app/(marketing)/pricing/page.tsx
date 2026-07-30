import type { Metadata } from "next";
import { PricingContent } from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing — Tamer Studio",
  description: "Explore Tamer Studio pricing plans, credit packs, and AI generation costs. Flexible plans for creators, agencies, and businesses.",
  keywords: ["Tamer Studio pricing", "AI generation costs", "credit packs", "production platform pricing"],
};

export default function PricingPage() {
  return <PricingContent />;
}
