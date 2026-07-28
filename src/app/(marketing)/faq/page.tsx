import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { FAQContent } from "./FAQContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/faq",
    title: "FAQ — Tamer Studio",
    description: "Frequently asked questions about Tamer Studio: billing, credits, AI models, providers, and platform features.",
    keywords: ["Tamer Studio FAQ", "help center", "billing questions", "AI credits"],
    type: "website",
  });
}

export default function FAQPage() {
  return <FAQContent />;
}
