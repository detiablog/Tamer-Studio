import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailProvider } from "@/lib/db/schema/email";
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

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!provider.name || provider.name.trim().length === 0) {
      errors.push("Provider name is required");
    }
    if (!provider.senderName || provider.senderName.trim().length === 0) {
      errors.push("Sender name is required");
    }
    if (!provider.senderEmail || provider.senderEmail.trim().length === 0) {
      errors.push("Sender email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (provider.senderEmail && !emailRegex.test(provider.senderEmail)) {
      errors.push("Invalid sender email format");
    }

    const config = (provider.config as Record<string, unknown>) || {};

    const validateConfig = (key: string) => {
      const val = config[key];
      return typeof val === "string" && val.length > 0;
    };

    if (provider.type === "smtp") {
      if (!validateConfig("host") && !validateConfig("hostname")) errors.push("SMTP host is required");
      if (!validateConfig("port") && !(config.secure as boolean)) errors.push("SMTP port is required");
      const auth = config.auth as Record<string, unknown> | undefined;
      if (!auth || (!validateConfig("user") && !validateConfig("username"))) errors.push("SMTP username is required");
      if (!auth || !validateConfig("pass")) errors.push("SMTP password is required");
    } else if (provider.type === "sendgrid") {
      if (!validateConfig("apiKey")) errors.push("SendGrid API key is required");
      if (validateConfig("apiKey") && !(config.apiKey as string).startsWith("SG.")) warnings.push("SendGrid API keys typically start with 'SG.'");
    } else if (provider.type === "resend") {
      if (!validateConfig("apiKey")) errors.push("Resend API key is required");
    } else if (provider.type === "amazon") {
      if (!validateConfig("accessKeyId")) errors.push("AWS Access Key ID is required");
      if (!validateConfig("secretAccessKey")) errors.push("AWS Secret Access Key is required");
      if (!validateConfig("region")) warnings.push("AWS region not specified, defaulting to us-east-1");
    } else if (provider.type === "mailgun") {
      if (!validateConfig("apiKey")) errors.push("Mailgun API key is required");
      if (!validateConfig("domain")) warnings.push("Mailgun domain not specified");
    } else if (provider.type === "postmark") {
      if (!validateConfig("apiKey")) errors.push("Postmark API key is required");
      if (!validateConfig("serverToken")) warnings.push("Postmark server token not specified");
    } else if (provider.type === "brevo") {
      if (!validateConfig("apiKey")) errors.push("Brevo API key is required");
    } else if (provider.type === "sparkpost") {
      if (!config.apiKey) errors.push("SparkPost API key is required");
    }

    const valid = errors.length === 0;

    return NextResponse.json({
      success: true,
      valid,
      errors,
      warnings,
      providerId: id,
      providerName: provider.name,
      providerType: provider.type,
    });
  } catch (error) {
    console.error("[Admin Email Provider Validate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate provider", details: String(error) },
      { status: 500 }
    );
  }
}
