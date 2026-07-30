import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About — Tamer Studio",
  description: "Learn about Tamer Studio, the AI-first production operating system for creators, agencies, and businesses.",
  keywords: ["Tamer Studio", "about Tamer Studio", "AI production platform", "company"],
  openGraph: {
    title: "About — Tamer Studio",
    description: "Learn about Tamer Studio, the AI-first production operating system for creators, agencies, and businesses.",
    type: "website",
    url: "https://tamerstudio.com/about",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Tamer Studio",
    description: "Learn about Tamer Studio, the AI-first production operating system for creators, agencies, and businesses.",
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return <AboutContent />;
}
