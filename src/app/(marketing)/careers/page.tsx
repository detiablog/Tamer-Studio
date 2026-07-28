import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { CareersContent } from "./CareersContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/careers",
    title: "Careers — Tamer Studio",
    description: "Join the Tamer Studio team. We're hiring engineers, designers, and product thinkers to build the future of AI-native production.",
    keywords: ["Tamer Studio careers", "jobs at Tamer Studio", "AI company jobs", "remote work"],
    type: "website",
  });
}

export default function CareersPage() {
  return <CareersContent />;
}
