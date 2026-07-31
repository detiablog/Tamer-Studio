import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SmtpTransportConfig {
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
  timeout?: number;
  encryption?: "none" | "ssl" | "tls" | "starttls";
}

export function createSmtpTransport(config: SmtpTransportConfig): Transporter {
  const secure = config.encryption === "ssl" || config.secure;

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure,
    auth: config.username && config.password
      ? { user: config.username, pass: config.password }
      : undefined,
    connectionTimeout: config.timeout || 30000,
    greetingTimeout: config.timeout || 30000,
    socketTimeout: config.timeout || 30000,
    tls: config.encryption === "tls" || config.encryption === "starttls"
      ? { rejectUnauthorized: true }
      : undefined,
  });
}

export interface SmtpTestResult {
  success: boolean;
  host: string;
  port: number;
  encryption: string;
  responseTime: number;
  serverResponse?: string;
  error?: string;
  errorType?:
    | "auth_failed"
    | "invalid_credentials"
    | "timeout"
    | "tls_error"
    | "certificate_error"
    | "dns_error"
    | "connection_refused"
    | "unknown";
}

export async function testSmtpConnection(config: SmtpTransportConfig): Promise<SmtpTestResult> {
  const start = Date.now();
  try {
    const transporter = createSmtpTransport(config);
    await transporter.verify();
    const responseTime = Date.now() - start;
    return {
      success: true,
      host: config.host,
      port: config.port,
      encryption: config.secure ? "SSL/TLS" : config.encryption === "starttls" ? "STARTTLS" : "None",
      responseTime,
      serverResponse: "Connection verified successfully",
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    const err = error as Error;
    const msg = err.message.toLowerCase();
    let errorType: SmtpTestResult["errorType"] = "unknown";

    if (msg.includes("auth") || msg.includes("login") || msg.includes("credential") || msg.includes("535")) {
      errorType = "auth_failed";
    } else if (msg.includes("timeout") || msg.includes("timed out")) {
      errorType = "timeout";
    } else if (msg.includes("tls") || msg.includes("ssl") || msg.includes("certificate") || msg.includes("cert")) {
      errorType = "certificate_error";
    } else if (msg.includes("dns") || msg.includes("resolve") || msg.includes("enotfound") || msg.includes("getaddrinfo")) {
      errorType = "dns_error";
    } else if (msg.includes("econnrefused") || msg.includes("refused")) {
      errorType = "connection_refused";
    }

    return {
      success: false,
      host: config.host,
      port: config.port,
      encryption: config.secure ? "SSL/TLS" : config.encryption === "starttls" ? "STARTTLS" : "None",
      responseTime,
      error: err.message,
      errorType,
    };
  }
}

export async function sendEmail(
  config: SmtpTransportConfig,
  options: {
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string; responseTime: number }> {
  const start = Date.now();
  try {
    const transporter = createSmtpTransport(config);
    const result = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });
    return {
      success: true,
      messageId: result.messageId,
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime: Date.now() - start,
    };
  }
}
