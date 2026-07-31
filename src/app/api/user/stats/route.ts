import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db";
import { workspace, workspaceMember, job, userMedia, auditLog } from "@/lib/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatAuditAction(action: string, resourceType: string | null): string {
  const resource = resourceType || "resource";
  const friendly = resource
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} ${friendly}`;
}

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

  try {
    const userId = ctx.state.userSession!.userId;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const workspaceFilter = sql`${workspace.id} in (select "id" from "workspace" where "owner_id" = ${userId}) or ${workspace.id} in (select "workspace_id" from "workspace_member" where "user_id" = ${userId} and "status" = 'active')`;

    const [activeProjectsResult] = await db
      .select({ count: sql<number>`count(distinct ${workspace.id})` })
      .from(workspace)
      .where(workspaceFilter);

    const [runningJobsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(job)
      .where(eq(job.status, "running"));

    const [queuedJobsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(job)
      .where(eq(job.status, "queued"));

    const [mediaAssetsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userMedia)
      .where(eq(userMedia.userId, userId));

    const [aiGenerationsTotalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(job);

    const [aiGenerationsTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(job)
      .where(gte(job.createdAt, startOfDay));

    const [activeProjectsDeltaResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workspace)
      .where(
        and(
          workspaceFilter,
          gte(workspace.createdAt, startOfWeek)
        )
      );

    const [mediaAssetsDeltaResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userMedia)
      .where(
        and(
          eq(userMedia.userId, userId),
          gte(userMedia.createdAt, startOfWeek)
        )
      );

    const recentProjects = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        status: workspace.status,
        updatedAt: workspace.updatedAt,
      })
      .from(workspace)
      .where(workspaceFilter)
      .orderBy(desc(workspace.updatedAt))
      .limit(5);

    const recentJobs = await db
      .select({
        id: job.id,
        name: job.type,
        status: job.status,
        progress: job.progress,
      })
      .from(job)
      .orderBy(desc(job.createdAt))
      .limit(5);

    const recentActivityRows = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        resourceType: auditLog.resourceType,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .where(eq(auditLog.actorId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(10);

    const statusMap: Record<string, string> = {
      active: "Active",
      draft: "Draft",
      completed: "Completed",
      archived: "Archived",
    };

    const jobStatusMap: Record<string, string> = {
      running: "Running",
      queued: "Queued",
      completed: "Completed",
      failed: "Failed",
    };

    return NextResponse.json(successResponse({
      activeProjects: activeProjectsResult?.count ?? 0,
      activeProjectsDelta: activeProjectsDeltaResult?.count ?? 0,
      mediaAssets: mediaAssetsResult?.count ?? 0,
      mediaAssetsDelta: mediaAssetsDeltaResult?.count ?? 0,
      runningJobs: runningJobsResult?.count ?? 0,
      queuedJobs: queuedJobsResult?.count ?? 0,
      aiGenerationsToday: aiGenerationsTodayResult?.count ?? 0,
      aiGenerationsTotal: aiGenerationsTotalResult?.count ?? 0,
      creditsRemaining: 0,
      recentProjects: recentProjects.map((p) => ({
        name: p.name,
        status: statusMap[p.status] || p.status,
        updated: timeAgo(p.updatedAt),
        progress: p.status === "completed" ? 100 : p.status === "active" ? 65 : 0,
      })),
      recentJobs: recentJobs.map((j) => ({
        name: j.name,
        status: jobStatusMap[j.status] || j.status,
        progress: j.progress,
        owner: "You",
      })),
      recentActivity: recentActivityRows.map((a) => ({
        text: formatAuditAction(a.action, a.resourceType),
        time: timeAgo(a.createdAt),
      })),
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
