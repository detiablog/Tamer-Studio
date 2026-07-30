import type { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact — Tamer Studio",
  description: "Get in touch with the Tamer Studio team. Reach out for support, partnerships, or general inquiries.",
  keywords: ["Tamer Studio contact", "support", "get in touch", "help"],
  openGraph: {
    title: "Contact — Tamer Studio",
    description: "Get in touch with the Tamer Studio team. Reach out for support, partnerships, or general inquiries.",
    type: "website",
    url: "https://tamerstudio.com/contact",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Tamer Studio",
    description: "Get in touch with the Tamer Studio team. Reach out for support, partnerships, or general inquiries.",
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactContent />;
}
