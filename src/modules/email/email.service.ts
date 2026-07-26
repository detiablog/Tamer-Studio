import type { EmailMessage, EmailResult, EmailService, EmailToken, EmailType, TokenType, EmailQueueManager } from "./email.interface";
import { defaultEmailRouter } from "./email.router";
import { databaseEmailQueue } from "./email.queue";
import { defaultEmailWorker } from "./email.worker";
import { emailTemplateEngine } from "./email.template";
import { emailLogger } from "./email.logger";
import { hashToken, generateSecureToken, generateId } from "./email.encryption";
import { db } from "@/lib/db";
import { emailToken } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export class DefaultEmailService implements EmailService {
  async send(message: EmailMessage, type: EmailType, options?: { priority?: number; scheduledAt?: Date }): Promise<string> {
    const queueId = await databaseEmailQueue.enqueue(message, type, options);
    emailLogger.info("Email queued", { queueId, type, to: message.to });
    return queueId;
  }

  async sendVerification(email: string, token: string, userName: string): Promise<string> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    const rendered = emailTemplateEngine.renderType("verification", { name: userName, verificationUrl });
    if (!rendered) {
      throw new Error("Verification template not found");
    }
    return this.send(
      {
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        from: process.env.NOTIFICATION_DEFAULT_FROM_EMAIL,
      },
      "verification",
      { priority: 10 }
    );
  }

  async sendResetPassword(email: string, token: string, userName: string): Promise<string> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const rendered = emailTemplateEngine.renderType("reset_password", { name: userName, resetUrl });
    if (!rendered) {
      throw new Error("Reset password template not found");
    }
    return this.send(
      {
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        from: process.env.NOTIFICATION_DEFAULT_FROM_EMAIL,
      },
      "reset_password",
      { priority: 10 }
    );
  }

  async sendPaymentSuccess(data: {
    email: string;
    userName: string;
    invoiceNumber: string;
    transactionNumber: string;
    paymentMethod: string;
    paymentDate: string;
    purchasedItem: string;
    totalPayment: string;
    invoiceUrl: string;
    dashboardUrl: string;
  }): Promise<string> {
    const rendered = emailTemplateEngine.renderType("payment_success", {
      name: data.userName,
      invoiceNumber: data.invoiceNumber,
      transactionNumber: data.transactionNumber,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      purchasedItem: data.purchasedItem,
      totalPayment: data.totalPayment,
      invoiceUrl: data.invoiceUrl,
      dashboardUrl: data.dashboardUrl,
    });
    if (!rendered) {
      throw new Error("Payment success template not found");
    }
    return this.send(
      {
        to: data.email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        from: process.env.NOTIFICATION_DEFAULT_FROM_EMAIL,
        metadata: { invoiceNumber: data.invoiceNumber, transactionNumber: data.transactionNumber },
      },
      "payment_success",
      { priority: 5 }
    );
  }

  async createVerificationToken(email: string, userId?: string): Promise<string> {
    const plainToken = generateSecureToken(32);
    const tokenId = generateId("token");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    emailLogger.info("Verification token created", { tokenId, email, userId, expiresAt });
    await db.insert(emailToken).values({
      id: tokenId,
      type: "verification",
      token: hashToken(plainToken),
      email,
      userId,
      expiresAt,
      createdAt: new Date(),
    });
    return plainToken;
  }

  async createResetPasswordToken(email: string, userId?: string, payload?: Record<string, unknown>): Promise<string> {
    const plainToken = generateSecureToken(32);
    const tokenId = generateId("token");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    emailLogger.info("Reset password token created", { tokenId, email, userId, expiresAt });
    await db.insert(emailToken).values({
      id: tokenId,
      type: "reset_password",
      token: hashToken(plainToken),
      email,
      userId,
      payload,
      expiresAt,
      createdAt: new Date(),
    });
    return plainToken;
  }

  async verifyToken(token: string, type: TokenType): Promise<EmailToken | null> {
    emailLogger.debug("Token verification attempted", { type });
    const hashed = hashToken(token);
    const result = await db
      .select()
      .from(emailToken)
      .where(and(
        eq(emailToken.token, hashed),
        eq(emailToken.type, type),
        sql`${emailToken.expiresAt} > NOW()`
      ))
      .limit(1);

    if (result.length === 0) {
      return null;
    }
    return result[0] as EmailToken;
  }

  async invalidateToken(token: string): Promise<void> {
    emailLogger.info("Token invalidated", { token: token.substring(0, 8) + "..." });
    const hashed = hashToken(token);
    await db
      .update(emailToken)
      .set({ usedAt: new Date() })
      .where(eq(emailToken.token, hashed));
  }

  getRouter(): typeof defaultEmailRouter {
    return defaultEmailRouter;
  }

  getQueue(): EmailQueueManager {
    return databaseEmailQueue;
  }

  getWorker(): typeof defaultEmailWorker {
    return defaultEmailWorker;
  }

  async renderTemplate(type: EmailType, variables: Record<string, unknown>): Promise<{ subject: string; html: string; text?: string }> {
    const rendered = emailTemplateEngine.renderType(type, variables as Record<string, string>);
    if (!rendered) {
      throw new Error(`Template not found for type: ${type}`);
    }
    return rendered;
  }
}

export const defaultEmailService = new DefaultEmailService();
