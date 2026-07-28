import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { CreditsContent } from "./CreditsContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/credits",
    title: "Credits — Tamer Studio",
    description: "Understand Tamer Studio credits: calculate costs, track usage, and manage your AI generation budget.",
    keywords: ["Tamer Studio credits", "AI generation costs", "credit calculator", "usage tracking"],
    type: "website",
  });
}

export default function CreditsPage() {
  return <CreditsContent />;
}
