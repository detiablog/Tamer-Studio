import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { logger } from "@/core/logger";

const FALLBACK_METRICS = {
  activeUsers: 0,
  projects: 0,
  aiJobs: 0,
  imagesGenerated: 0,
  videosGenerated: 0,
  storageUsed: "0 GB",
  apiRequests: 0,
  queueLength: 0,
};

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.METRICS_BACKEND_URL?.trim();

    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Tamer-Studio-Public-Metrics/1.0",
          },
          signal: controller.signal,
          next: { revalidate: 60 },
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            success: true,
            data: {
              activeUsers: Number(data.activeUsers ?? data.active_users ?? 0),
              projects: Number(data.projects ?? data.total_projects ?? 0),
              aiJobs: Number(data.aiJobs ?? data.total_jobs ?? 0),
              imagesGenerated: Number(data.imagesGenerated ?? data.images_generated ?? 0),
              videosGenerated: Number(data.videosGenerated ?? data.videos_generated ?? 0),
              storageUsed: String(data.storageUsed ?? data.storage_used ?? "0 GB"),
              apiRequests: Number(data.apiRequests ?? data.api_requests ?? 0),
              queueLength: Number(data.queueLength ?? data.queue_length ?? 0),
            },
            timestamp: new Date().toISOString(),
          });
        }
      } catch {
        logger.warn("[Public Metrics] Backend unavailable, using fallback");
      }
    }

    return NextResponse.json({
      success: true,
      data: FALLBACK_METRICS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[Public Metrics] Fatal error:", error instanceof Error ? error : undefined);
    return NextResponse.json({
      success: true,
      data: FALLBACK_METRICS,
      timestamp: new Date().toISOString(),
    });
  }
}
