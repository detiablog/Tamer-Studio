import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { DocsContent } from "./DocsContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/docs",
    title: "Documentation — Tamer Studio",
    description: "Learn how to use Tamer Studio to manage your content production lifecycle. Guides for workspace setup, projects, AI providers, and publishing.",
    keywords: ["Tamer Studio docs", "documentation", "tutorials", "getting started", "guides"],
    type: "website",
  });
}

export default function DocsPage() {
  return <DocsContent />;
}
