import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { TermsContent } from "./TermsContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/legal/terms",
    title: "Terms of Service — Tamer Studio",
    description: "Tamer Studio Terms of Service. Read the terms and conditions for using the Tamer Studio platform.",
    keywords: ["Tamer Studio terms", "terms of service", "legal", "conditions"],
    type: "website",
  });
}

export default function TermsPage() {
  return <TermsContent />;
}
