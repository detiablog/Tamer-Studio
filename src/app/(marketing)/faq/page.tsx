import type { Metadata } from "next";
import { FAQContent } from "./FAQContent";

export const metadata: Metadata = {
  title: "FAQ — Tamer Studio",
  description: "Frequently asked questions about Tamer Studio: billing, credits, AI models, providers, and platform features.",
  keywords: ["Tamer Studio FAQ", "help center", "billing questions", "AI credits"],
  openGraph: {
    title: "FAQ — Tamer Studio",
    description: "Frequently asked questions about Tamer Studio: billing, credits, AI models, providers, and platform features.",
    type: "website",
    url: "https://tamerstudio.com/faq",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Tamer Studio",
    description: "Frequently asked questions about Tamer Studio: billing, credits, AI models, providers, and platform features.",
  },
  robots: { index: true, follow: true },
};

export default function FAQPage() {
  return <FAQContent />;
}
