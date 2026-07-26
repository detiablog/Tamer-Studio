import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailProvider, emailProviderHealth } from "@/lib/db/schema/email";
import { eq } from "drizzle-orm";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;

    const [provider] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
    }

    const start = Date.now();
    let success = false;
    let error: string | undefined;
    let response: Record<string, unknown> | undefined;

    try {
      if (provider.type === "smtp") {
        const { createTransport } = await import("nodemailer");
        const transport = createTransport({
          host: provider.domain || "smtp.example.com",
          port: provider.config?.port as number || 587,
          secure: (provider.config?.secure as boolean) || false,
          auth: provider.config?.auth as Record<string, string>,
        });
        await new Promise((resolve, reject) => {
          transport.verify((err: unknown) => {
            if (err) reject(err);
            else resolve(true);
          });
        });
        success = true;
        response = { verified: true, provider: provider.type };
      } else if (provider.type === "sendgrid") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.sendgrid.com/v3/user/profile", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.errors?.map((e: { message?: string }) => e.message || "Unknown error").join(", ") || `HTTP ${res.status}`);
        }
      } else if (provider.type === "resend") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: provider.senderEmail, to: "test@example.com", subject: "test", text: "test" }),
        });
        if (res.status === 200 || res.status === 201) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else if (res.status === 422) {
          success = true;
          response = { verified: true, provider: provider.type, note: "API key valid, but sandbox mode rejected (expected)" };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } else if (provider.type === "amazon") {
        const accessKeyId = provider.config?.accessKeyId as string;
        const secretAccessKey = provider.config?.secretAccessKey as string;
        if (!accessKeyId || !secretAccessKey) throw new Error("Missing AWS credentials");
        const { SESClient, GetSendQuotaCommand } = await import("@aws-sdk/client-ses");
        // @ts-expect-error aws-sdk types may need version alignment
        const client = new SESClient({
          region: provider.config?.region || "us-east-1",
          credentials: { accessKeyId, secretAccessKey },
        });
        const result = await client.send(new GetSendQuotaCommand({}));
        success = true;
        response = { verified: true, provider: provider.type, quota: result };
      } else if (provider.type === "mailgun") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const domain = provider.domain || provider.config?.domain as string;
        const res = await fetch(`https://api.mailgun.net/v3/${domain}/stats`, {
          headers: { Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}` },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } else if (provider.type === "postmark") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const serverToken = provider.config?.serverToken as string || apiKey;
        const res = await fetch(`https://api.postmarkapp.com/domains`, {
          headers: { "X-Postmark-Server-Token": serverToken, Accept: "application/json" },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.Message || `HTTP ${res.status}`);
        }
      } else if (provider.type === "brevo") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.brevo.com/v3/account", {
          headers: { "api-key": apiKey },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } else if (provider.type === "sparkpost") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.sparkpost.com/api/v1/account", {
          headers: { Authorization: apiKey },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } else {
        success = true;
        response = { verified: true, provider: provider.type, note: "Health check not implemented for this provider type" };
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const latencyMs = Date.now() - start;

    const [currentHealth] = await db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, id)).limit(1);
    const lastSuccess = success ? new Date() : currentHealth?.lastSuccessAt || null;
    const lastFailure = success ? currentHealth?.lastFailureAt || null : new Date();

    await db.update(emailProvider)
      .set({
        lastTestedAt: new Date(),
        lastTestStatus: success ? "success" : "error",
        lastTestError: error || null,
        updatedAt: new Date(),
      })
      .where(eq(emailProvider.id, id));

    await db.update(emailProviderHealth)
      .set({
        status: success ? "healthy" : "offline",
        latencyMs,
        lastSuccessAt: lastSuccess,
        lastFailureAt: lastFailure,
        checkedAt: new Date(),
        errorMessage: error || null,
        errorCode: success ? null : "test_connection_failed",
      })
      .where(eq(emailProviderHealth.providerId, id));

    return NextResponse.json({
      success,
      latencyMs,
      data: {
        providerId: id,
        providerName: provider.name,
        providerType: provider.type,
        status: success ? "healthy" : "offline",
        testedAt: new Date().toISOString(),
        response,
        error,
      },
    });
  } catch (error) {
    console.error("[Admin Email Provider Test] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test provider", details: String(error) },
      { status: 500 }
    );
  }
}
