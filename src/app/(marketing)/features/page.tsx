import type { Metadata } from "next";
import { FeaturesContent } from "./FeaturesContent";

export const metadata: Metadata = {
  title: "Features — Tamer Studio",
  description: "Discover Tamer Studio features: AI content generation, multi-provider support, project management, publishing, and production workflows.",
  keywords: ["Tamer Studio features", "AI content generation", "production workflows", "multi-provider AI"],
  openGraph: {
    title: "Features — Tamer Studio",
    description: "Discover Tamer Studio features: AI content generation, multi-provider support, project management, publishing, and production workflows.",
    type: "website",
    url: "https://tamerstudio.com/features",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — Tamer Studio",
    description: "Discover Tamer Studio features: AI content generation, multi-provider support, project management, publishing, and production workflows.",
  },
  robots: { index: true, follow: true },
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
