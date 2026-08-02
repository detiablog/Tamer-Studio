import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication } from "@/core/middleware";
import { EmailAdminService } from "@/core/email/email-admin.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { sendEmail } from "@/lib/email/smtp";
import type { SmtpTransportConfig } from "@/lib/email/smtp";
import { z } from "zod";

const SendTestSchema = z.object({
  recipientEmail: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const parsed = SendTestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input: " + parsed.error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const service = new EmailAdminService();
    const providers = await service.getProviders();
    const smtpProvider = providers.find((p: any) => p.type === "smtp");

    if (!smtpProvider) {
      return NextResponse.json(
        { success: false, error: "No SMTP provider configured" },
        { status: 400 }
      );
    }

    const detailed = await service.getProvider(smtpProvider.id);
    let credentials: Record<string, unknown> = {};
    if (detailed?.credentials && typeof detailed.credentials === "object" && detailed.credentials !== null) {
      credentials = detailed.credentials as Record<string, unknown>;
    }

    const config: SmtpTransportConfig = {
      host: String(credentials.host || ""),
      port: Number(credentials.port) || 587,
      secure: credentials.secure === true || credentials.secure === "true" || credentials.encryption === "ssl",
      username: credentials.username ? String(credentials.username) : undefined,
      password: credentials.password ? String(credentials.password) : undefined,
      timeout: (smtpProvider.timeout || 30) * 1000,
      encryption: (credentials.encryption as SmtpTransportConfig["encryption"]) || "none",
    };

    if (!config.host) {
      return NextResponse.json(
        { success: false, error: "SMTP host is not configured" },
        { status: 400 }
      );
    }

    const fromAddress = smtpProvider.senderEmail || config.username || "noreply@tamerstudio.com";
    const senderName = smtpProvider.senderName || "Tamer Studio";

    const result = await sendEmail(config, {
      from: `${senderName} <${fromAddress}>`,
      to: parsed.data.recipientEmail,
      subject: "Tamer Studio - SMTP Test Email",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h2 style="color:#6366f1;">SMTP Test Email</h2>
<p>This is a test email sent from Tamer Studio to verify your SMTP configuration.</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Server</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${config.host}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Port</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${config.port}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Encryption</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${config.secure ? "SSL/TLS" : "None"}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b;">Sent At</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${new Date().toISOString()}</td></tr>
</table>
<p style="color:#64748b;font-size:12px;">If you received this email, your SMTP configuration is working correctly.</p>
</body></html>`,
      text: `SMTP Test Email\n\nServer: ${config.host}\nPort: ${config.port}\nEncryption: ${config.secure ? "SSL/TLS" : "None"}\nSent At: ${new Date().toISOString()}\n\nIf you received this email, your SMTP configuration is working correctly.`,
      replyTo: smtpProvider.replyTo || undefined,
    });

    if (result.success) {
      return NextResponse.json(
        successResponse({
          success: true,
          messageId: result.messageId,
          responseTime: result.responseTime,
          recipient: parsed.data.recipientEmail,
        }, "Test email sent successfully")
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send test email" },
        { status: 500 }
      );
    }
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
