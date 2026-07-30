import type { Metadata } from "next";
import { BlogContent } from "./BlogContent";

export const metadata: Metadata = {
  title: "Blog — Tamer Studio",
  description: "Read the latest articles, guides, and updates from the Tamer Studio team. Insights on AI production, workflows, and cost optimization.",
  keywords: ["Tamer Studio blog", "AI production articles", "guides", "updates"],
  openGraph: {
    title: "Blog — Tamer Studio",
    description: "Read the latest articles, guides, and updates from the Tamer Studio team. Insights on AI production, workflows, and cost optimization.",
    type: "website",
    url: "https://tamerstudio.com/blog",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Tamer Studio",
    description: "Read the latest articles, guides, and updates from the Tamer Studio team. Insights on AI production, workflows, and cost optimization.",
  },
  robots: { index: true, follow: true },
};

export default function BlogPage() {
  return <BlogContent />;
}
