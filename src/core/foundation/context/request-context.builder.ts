import type { NextRequest } from "next/server";
import type { RequestContext, SecurityState } from "@/core/middleware/types";
import { logger } from "@/core/logger/logger";

export class RequestContextBuilder {
  private traceId?: string;
  private requestId?: string;
  private locale?: string;
  private currency?: string;
  private timezone?: string;
  private ip?: string;
  private userAgent?: string;
  private securityState: SecurityState = {};

  static fromNextRequest(request: NextRequest): RequestContextBuilder {
    const builder = new RequestContextBuilder();

    builder.traceId = request.headers.get("x-trace-id") ?? undefined;
    builder.requestId = request.headers.get("x-request-id") ?? undefined;
    builder.locale = request.headers.get("accept-language")?.split(",")[0].trim() ?? undefined;
    builder.currency = request.headers.get("x-currency") ?? undefined;
    builder.timezone = request.headers.get("x-timezone") ?? undefined;
    builder.ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined;
    builder.userAgent = request.headers.get("user-agent") ?? undefined;

    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookies = new URLSearchParams(cookieHeader.replace(/; /g, "&"));

    const sessionToken = cookies.get("session") ?? undefined;
    if (sessionToken) {
      builder.securityState.userSession = {
        id: sessionToken,
        userId: "",
        expiresAt: new Date(Date.now() + 3600000),
        role: "user",
      };
    }

    const adminSession = cookies.get("admin_session") ?? undefined;
    if (adminSession) {
      builder.securityState.adminSession = {
        id: adminSession,
        adminId: "",
        expiresAt: new Date(Date.now() + 3600000),
        role: "admin",
      };
    }

    return builder;
  }

  withTraceId(traceId: string): this {
    this.traceId = traceId;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withLocale(locale: string): this {
    this.locale = locale;
    return this;
  }

  withCurrency(currency: string): this {
    this.currency = currency;
    return this;
  }

  withTimezone(timezone: string): this {
    this.timezone = timezone;
    return this;
  }

  withIp(ip: string): this {
    this.ip = ip;
    return this;
  }

  withUserAgent(userAgent: string): this {
    this.userAgent = userAgent;
    return this;
  }

  withSecurityState(state: Partial<SecurityState>): this {
    this.securityState = { ...this.securityState, ...state };
    return this;
  }

  withWorkspaceId(workspaceId: string): this {
    this.securityState.workspaceId = workspaceId;
    return this;
  }

  withOrganizationId(organizationId: string): this {
    this.securityState.organizationId = organizationId;
    return this;
  }

  withSubscriptionId(subscriptionId: string): this {
    this.securityState.subscriptionId = subscriptionId;
    return this;
  }

  build(request: NextRequest, params?: Record<string, string>): RequestContext {
    const ctx: RequestContext = {
      request,
      params,
      state: this.securityState,
      method: request.method,
      pathname: request.nextUrl.pathname,
      traceId: this.traceId,
      requestId: this.requestId,
      locale: this.locale,
      currency: this.currency,
      timezone: this.timezone,
      ip: this.ip,
      userAgent: this.userAgent,
    };

    logger.debug("RequestContext built", {
      pathname: ctx.pathname,
      method: ctx.method,
      traceId: ctx.traceId,
      requestId: ctx.requestId,
    });

    return ctx;
  }
}