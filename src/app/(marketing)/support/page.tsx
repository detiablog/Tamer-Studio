import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { SupportContent } from "./SupportContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/support",
    title: "Support — Tamer Studio",
    description: "Get help with Tamer Studio. Contact support, browse FAQs, read documentation, or join the community.",
    keywords: ["Tamer Studio support", "help center", "contact support", "documentation"],
    type: "website",
  });
}

export default function SupportPage() {
  return <SupportContent />;
}
