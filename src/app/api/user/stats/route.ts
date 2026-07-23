import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    activeProjects: 12,
    mediaAssets: 48,
    runningJobs: 3,
    queuedJobs: 2,
    aiGenerationsToday: 24,
    aiGenerationsTotal: 156,
    creditsRemaining: 8432,
    recentProjects: [
      { name: "Q4 Affiliate Campaign", status: "In Production", updated: "2 hours ago", progress: 65 },
      { name: "YouTube Shorts Series", status: "Draft", updated: "1 day ago", progress: 20 },
      { name: "TikTok Product Launch", status: "Completed", updated: "3 days ago", progress: 100 },
      { name: "Instagram Reels Batch", status: "In Review", updated: "5 hours ago", progress: 85 },
    ],
    recentJobs: [
      { name: "Hero Video Render", status: "Running", progress: 72, owner: "You" },
      { name: "Product Image Batch", status: "Queued", progress: 0, owner: "You" },
      { name: "Voiceover Generation", status: "Running", progress: 45, owner: "You" },
    ],
    recentActivity: [
      { text: "Project 'Q4 Campaign' was updated", time: "2 hours ago" },
      { text: "Image generation completed", time: "4 hours ago" },
      { text: "New team member joined", time: "1 day ago" },
      { text: "Production job failed", time: "2 days ago" },
    ],
  });
}