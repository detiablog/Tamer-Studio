import type { Metadata } from "next";
import { CareersContent } from "./CareersContent";

export const metadata: Metadata = {
  title: "Careers — Tamer Studio",
  description: "Join the Tamer Studio team. We're hiring engineers, designers, and product thinkers to build the future of AI-native production.",
  keywords: ["Tamer Studio careers", "jobs at Tamer Studio", "AI company jobs", "remote work"],
  openGraph: {
    title: "Careers — Tamer Studio",
    description: "Join the Tamer Studio team. We're hiring engineers, designers, and product thinkers to build the future of AI-native production.",
    type: "website",
    url: "https://tamerstudio.com/careers",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers — Tamer Studio",
    description: "Join the Tamer Studio team. We're hiring engineers, designers, and product thinkers to build the future of AI-native production.",
  },
  robots: { index: true, follow: true },
};

export default function CareersPage() {
  return <CareersContent />;
}
