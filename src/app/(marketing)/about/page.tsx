import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { AboutContent } from "./AboutContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/about",
    title: "About — Tamer Studio",
    description: "Learn about Tamer Studio, the AI-first production operating system for creators, agencies, and businesses.",
    keywords: ["Tamer Studio", "about Tamer Studio", "AI production platform", "company"],
    type: "website",
  });
}

export default function AboutPage() {
  return <AboutContent />;
}
