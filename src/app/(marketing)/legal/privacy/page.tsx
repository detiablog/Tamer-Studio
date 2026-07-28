import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { PrivacyContent } from "./PrivacyContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/legal/privacy",
    title: "Privacy Policy — Tamer Studio",
    description: "Tamer Studio Privacy Policy. Learn how we collect, use, and protect your data.",
    keywords: ["Tamer Studio privacy", "privacy policy", "data protection", "GDPR"],
    type: "website",
  });
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
