import type { Metadata } from "next";
import { CreditsContent } from "./CreditsContent";

export const metadata: Metadata = {
  title: "Credits — Tamer Studio",
  description: "Understand Tamer Studio credits: calculate costs, track usage, and manage your AI generation budget.",
  keywords: ["Tamer Studio credits", "AI generation costs", "credit calculator", "usage tracking"],
  openGraph: {
    title: "Credits — Tamer Studio",
    description: "Understand Tamer Studio credits: calculate costs, track usage, and manage your AI generation budget.",
    type: "website",
    url: "https://tamerstudio.com/credits",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Credits — Tamer Studio",
    description: "Understand Tamer Studio credits: calculate costs, track usage, and manage your AI generation budget.",
  },
  robots: { index: true, follow: true },
};

export default function CreditsPage() {
  return <CreditsContent />;
}
