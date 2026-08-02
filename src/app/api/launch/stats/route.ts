import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { userAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { checklistService } from "@/core/launch/checklist.service";
import { certificationService } from "@/core/launch/certification.service";
import { launchReportService } from "@/core/launch/report.service";
import { launchMetricsService } from "@/core/launch/metrics.service";

export const dynamic = "force-dynamic";

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

  const middlewareError = await runMiddleware([userAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const [checklistProgress, certification, reports, events] = await Promise.all([
      checklistService.getProgress(),
      certificationService.getLatestCertification(),
      launchReportService.listReports({ limit: 5 }),
      launchMetricsService.listEvents({ limit: 10 }),
    ]);

    return NextResponse.json(successResponse({
      checklist: checklistProgress,
      certification: certification ? {
        status: certification.status,
        score: certification.overallScore,
        version: certification.version,
      } : null,
      recentReports: reports.data?.length || 0,
      recentEvents: events.data?.length || 0,
      metricsCount: (await launchMetricsService.getMetrics(undefined, 24)).length,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
