import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { BlogContent } from "./BlogContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/blog",
    title: "Blog — Tamer Studio",
    description: "Read the latest articles, guides, and updates from the Tamer Studio team. Insights on AI production, workflows, and cost optimization.",
    keywords: ["Tamer Studio blog", "AI production articles", "guides", "updates"],
    type: "website",
  });
}

export default function BlogPage() {
  return <BlogContent />;
}
