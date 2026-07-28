import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { ContactContent } from "./ContactContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/contact",
    title: "Contact — Tamer Studio",
    description: "Get in touch with the Tamer Studio team. Reach out for support, partnerships, or general inquiries.",
    keywords: ["Tamer Studio contact", "support", "get in touch", "help"],
    type: "website",
  });
}

export default function ContactPage() {
  return <ContactContent />;
}
