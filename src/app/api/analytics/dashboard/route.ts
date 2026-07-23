import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceDashboardMetrics } from "@/core/analytics/aggregation";

export async function GET(request: NextRequest) {
  try {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Validate user has access to workspace (implement based on auth)
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const metrics = await getWorkspaceDashboardMetrics(
      workspaceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
