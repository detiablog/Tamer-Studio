import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jobStore } from "@/core/jobs/job-store";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";

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
    adminAuthentication(),
    requireAdminPermission("admin:queues"),
  ], ctx);

  if (errorResponse) {
    return errorResponse;
  }

  const stats = jobStore.getStats();
  const queue = jobStore.getQueue();
  const deadLetter = jobStore.getDeadLetter();

  const queues = [
    {
      id: "video-processing",
      name: "Video Processing",
      depth: queue.filter((j) => j.type === "video.generate").length,
      throughput: "2.1/min",
      avgWait: "45s",
      status: "Healthy",
      failed: deadLetter.filter((j) => j.type === "video.generate").length,
    },
    {
      id: "image-generation",
      name: "Image Generation",
      depth: queue.filter((j) => j.type === "image.generate").length,
      throughput: "5.4/min",
      avgWait: "1m 20s",
      status: "Healthy",
      failed: deadLetter.filter((j) => j.type === "image.generate").length,
    },
    {
      id: "audio-generation",
      name: "Audio Generation",
      depth: queue.filter((j) => j.type === "audio.generate").length,
      throughput: "0.8/min",
      avgWait: "2m",
      status: "Degraded",
      failed: deadLetter.filter((j) => j.type === "audio.generate").length,
    },
    {
      id: "script-generation",
      name: "Script Generation",
      depth: queue.filter((j) => j.type === "text.generate").length,
      throughput: "0/min",
      avgWait: "—",
      status: "Idle",
      failed: deadLetter.filter((j) => j.type === "text.generate").length,
    },
    {
      id: "media-processing",
      name: "Media Processing",
      depth: queue.filter((j) => j.type === "media.process").length,
      throughput: "3.2/min",
      avgWait: "1m 10s",
      status: "Healthy",
      failed: deadLetter.filter((j) => j.type === "media.process").length,
    },
  ];

  return NextResponse.json({ queues, stats });
}
