import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { FeaturesContent } from "./FeaturesContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/features",
    title: "Features — Tamer Studio",
    description: "Discover Tamer Studio features: AI content generation, multi-provider support, project management, publishing, and production workflows.",
    keywords: ["Tamer Studio features", "AI content generation", "production workflows", "multi-provider AI"],
    type: "website",
  });
}

export default function FeaturesPage() {
  return <FeaturesContent />;
}
