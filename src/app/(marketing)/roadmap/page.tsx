import type { Metadata } from "next";
import { generatePageMetadata } from "@/core/seo";
import { RoadmapContent } from "./RoadmapContent";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    route: "/roadmap",
    title: "Roadmap — Tamer Studio",
    description: "See what's coming to Tamer Studio. Vote on planned features, track in-progress work, and explore completed milestones.",
    keywords: ["Tamer Studio roadmap", "upcoming features", "product roadmap", "feature voting"],
    type: "website",
  });
}

export default function RoadmapPage() {
  return <RoadmapContent />;
}
