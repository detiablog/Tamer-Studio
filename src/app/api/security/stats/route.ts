import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { threatDetectorService } from "@/core/security-hub/threat-detector.service";
import { secIncidentService } from "@/core/security-hub/incident.service";
import { sessionMonitorService } from "@/core/security-hub/session-monitor.service";
import { apiMonitorService } from "@/core/security-hub/api-monitor.service";
import { uploadMonitorService } from "@/core/security-hub/upload-monitor.service";
import { complianceService } from "@/core/security-hub/compliance.service";

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

  const middlewareError = await runMiddleware([adminAuthentication()], ctx);
  if (middlewareError) return middlewareError;

  try {
    const [threats, incidents, sessions, api, uploads, compliance] = await Promise.all([
      threatDetectorService.getStats(),
      secIncidentService.getStats(),
      sessionMonitorService.getStats(),
      apiMonitorService.getStats(),
      uploadMonitorService.getStats(),
      complianceService.getStats(),
    ]);
    return NextResponse.json(successResponse({ threats, incidents, sessions, api, uploads, compliance }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
