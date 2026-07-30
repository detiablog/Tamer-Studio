import type { Metadata } from "next";
import { DocsContent } from "./DocsContent";

export const metadata: Metadata = {
  title: "Documentation — Tamer Studio",
  description: "Learn how to use Tamer Studio to manage your content production lifecycle. Guides for workspace setup, projects, AI providers, and publishing.",
  keywords: ["Tamer Studio docs", "documentation", "tutorials", "getting started", "guides"],
  openGraph: {
    title: "Documentation — Tamer Studio",
    description: "Learn how to use Tamer Studio to manage your content production lifecycle. Guides for workspace setup, projects, AI providers, and publishing.",
    type: "website",
    url: "https://tamerstudio.com/docs",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation — Tamer Studio",
    description: "Learn how to use Tamer Studio to manage your content production lifecycle. Guides for workspace setup, projects, AI providers, and publishing.",
  },
  robots: { index: true, follow: true },
};

export default function DocsPage() {
  return <DocsContent />;
}
