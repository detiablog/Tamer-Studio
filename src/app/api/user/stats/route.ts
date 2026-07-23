import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([
    userAuthentication(),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

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
