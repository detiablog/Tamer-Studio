import type { Metadata } from "next";
import { RoadmapContent } from "./RoadmapContent";

export const metadata: Metadata = {
  title: "Roadmap — Tamer Studio",
  description: "See what's coming to Tamer Studio. Vote on planned features, track in-progress work, and explore completed milestones.",
  keywords: ["Tamer Studio roadmap", "upcoming features", "product roadmap", "feature voting"],
  openGraph: {
    title: "Roadmap — Tamer Studio",
    description: "See what's coming to Tamer Studio. Vote on planned features, track in-progress work, and explore completed milestones.",
    type: "website",
    url: "https://tamerstudio.com/roadmap",
    siteName: "Tamer Studio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap — Tamer Studio",
    description: "See what's coming to Tamer Studio. Vote on planned features, track in-progress work, and explore completed milestones.",
  },
  robots: { index: true, follow: true },
};

export default function RoadmapPage() {
  return <RoadmapContent />;
}
