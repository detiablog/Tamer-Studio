import type { Metadata } from "next";
import { SupportContent } from "./SupportContent";

export const metadata: Metadata = {
  title: "Support — Tamer Studio",
  description: "Get help with Tamer Studio. Contact support, browse FAQs, read documentation, or join the community.",
  keywords: ["Tamer Studio support", "help center", "contact support", "documentation"],
  openGraph: {
    title: "Support — Tamer Studio",
    description: "Get help with Tamer Studio. Contact support, browse FAQs, read documentation, or join the community.",
    type: "website",
    url: "https://tamerstudio.com/support",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support — Tamer Studio",
    description: "Get help with Tamer Studio. Contact support, browse FAQs, read documentation, or join the community.",
  },
  robots: { index: true, follow: true },
};

export default function SupportPage() {
  return <SupportContent />;
}
