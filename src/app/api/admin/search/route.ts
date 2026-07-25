import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { db } from "@/lib/db";
import { user, organization, workspace, aiProvider, job, queue, coupon, subscription } from "@/lib/db/schema";
import { eq, ilike, or, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getAdminContext(request: NextRequest) {
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

  const errorResponse = await runMiddleware([adminAuthentication(), requireAdminPermission("admin:users")], ctx);
  if (errorResponse) return { error: errorResponse as Response };

  return { adminSession: ctx.state.adminSession };
}

export async function GET(request: NextRequest) {
  const ctx = await getAdminContext(request);
  if ("error" in ctx) return ctx.error;

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const pattern = `%${q.replace(/%/g, "\\%")}%`;
  const results: Array<{ type: string; id: string; label: string; description?: string; href: string }> = [];

  try {
    const [users, orgs, workspaces, providers, jobs, queues, coupons, subscriptionsRows] = await Promise.all([
      db.select({ id: user.id, label: user.name, description: user.email }).from(user).where(or(ilike(user.name, pattern), ilike(user.email, pattern))).limit(5),
      db.select({ id: organization.id, label: organization.name }).from(organization).where(ilike(organization.name, pattern)).limit(5),
      db.select({ id: workspace.id, label: workspace.name, description: workspace.slug }).from(workspace).where(ilike(workspace.name, pattern)).limit(5),
      db.select({ id: aiProvider.id, label: aiProvider.name, description: aiProvider.providerType }).from(aiProvider).where(ilike(aiProvider.name, pattern)).limit(5),
      db.select({ id: job.id, label: job.type, description: job.status }).from(job).where(ilike(job.type, pattern)).limit(5),
      db.select({ id: queue.id, label: queue.name }).from(queue).where(ilike(queue.name, pattern)).limit(5),
      db.select({ id: coupon.id, label: coupon.code, description: coupon.type }).from(coupon).where(ilike(coupon.code, pattern)).limit(5),
      db.select({ id: subscription.id, label: subscription.planId, description: subscription.status }).from(subscription).where(ilike(subscription.planId, pattern)).limit(5),
    ]);

    for (const u of users) results.push({ type: "users", id: u.id, label: u.label, description: u.description, href: `/admin/users` });
    for (const o of orgs) results.push({ type: "organizations", id: o.id, label: o.label, href: `/admin/organizations` });
    for (const w of workspaces) results.push({ type: "workspaces", id: w.id, label: w.label, description: w.description, href: `/admin/workspaces` });
    for (const p of providers) results.push({ type: "providers", id: p.id, label: p.label, description: p.description, href: `/admin/ai-providers` });
    for (const j of jobs) results.push({ type: "jobs", id: j.id, label: j.label, description: j.description, href: `/admin/jobs` });
    for (const q of queues) results.push({ type: "queues", id: q.id, label: q.label, href: `/admin/queues` });
    for (const c of coupons) results.push({ type: "coupons", id: c.id, label: c.label, description: c.description, href: `/admin/coupons` });
    for (const s of subscriptionsRows) results.push({ type: "subscriptions", id: s.id, label: s.label, description: s.description, href: `/admin/subscriptions` });
  } catch (error) {
    console.error("[Admin Search] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ results });
}
