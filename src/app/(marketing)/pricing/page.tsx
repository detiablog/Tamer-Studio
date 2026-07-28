import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { PricingContent } from "./PricingContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/pricing",
    title: "Pricing — Tamer Studio",
    description: "Explore Tamer Studio pricing plans, credit packs, and AI generation costs. Flexible plans for creators, agencies, and businesses.",
    keywords: ["Tamer Studio pricing", "AI generation costs", "credit packs", "production platform pricing"],
    type: "website",
  });
}

export default function PricingPage() {
  return <PricingContent />;
}
