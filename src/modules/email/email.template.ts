import type { EmailMessage, EmailTemplate, EmailType } from "./email.interface";

const DEFAULT_TEMPLATES: Record<string, Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">> = {
  "verification.welcome": {
    key: "verification.welcome",
    name: "Account Verification",
    type: "verification",
    subject: "Verify your Tamer Studio account",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
      <div style="text-align: center; padding: 40px 0;">
        <div style="font-size: 48px; margin-bottom: 16px;">📩</div>
        <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: #1a1a2e;">Verify Your Email</h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">Tamer Studio - AI Creative Platform</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; margin: 24px 0;">
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Hi {{name}},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Welcome to Tamer Studio! Please verify your email address to activate your account and start building.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{verificationUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8; margin: 0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
      <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">Need help? <a href="mailto:support@tamer.studio" style="color: #6366f1;">support@tamer.studio</a></p>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0;">© ${new Date().getFullYear()} Tamer Studio. All rights reserved.</p>
      </div>
    </div>`,
    text: "Hi {{name}},\n\nWelcome to Tamer Studio! Please verify your email address by clicking this link: {{verificationUrl}}\n\nThis link expires in 24 hours.\n\nNeed help? support@tamer.studio\n\n© ${new Date().getFullYear()} Tamer Studio",
    variables: ["name", "verificationUrl"],
    isActive: true,
    version: 1,
    language: "en",
    isSystem: true,
  },
  "reset-password.request": {
    key: "reset-password.request",
    name: "Reset Password",
    type: "reset_password",
    subject: "Reset your Tamer Studio password",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
      <div style="text-align: center; padding: 40px 0;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
        <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: #1a1a2e;">Reset Your Password</h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">Tamer Studio - AI Creative Platform</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; margin: 24px 0;">
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Hi {{name}},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 30 minutes.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{resetUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #94a3b8; margin: 0;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
      </div>
      <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">Need help? <a href="mailto:support@tamer.studio" style="color: #6366f1;">support@tamer.studio</a></p>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0;">© ${new Date().getFullYear()} Tamer Studio. All rights reserved.</p>
      </div>
    </div>`,
    text: "Hi {{name}},\n\nWe received a request to reset your password. Click this link to reset it: {{resetUrl}}\n\nThis link expires in 30 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\nNeed help? support@tamer.studio\n\n© ${new Date().getFullYear()} Tamer Studio",
    variables: ["name", "resetUrl"],
    isActive: true,
    version: 1,
    language: "en",
    isSystem: true,
  },
  "payment-success.invoice": {
    key: "payment-success.invoice",
    name: "Payment Success & Invoice",
    type: "payment_success",
    subject: "Payment confirmed - Invoice {{invoiceNumber}}",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
      <div style="text-align: center; padding: 40px 0;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: #1a1a2e;">Payment Successful</h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">Tamer Studio - AI Creative Platform</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; margin: 24px 0;">
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Hi {{name}},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">Your payment has been confirmed! Here are your invoice details:</p>
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 14px;">Invoice Number</span>
            <span style="font-weight: 600; font-size: 14px;">{{invoiceNumber}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 14px;">Transaction Number</span>
            <span style="font-weight: 600; font-size: 14px;">{{transactionNumber}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 14px;">Payment Method</span>
            <span style="font-weight: 600; font-size: 14px;">{{paymentMethod}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 14px;">Payment Date</span>
            <span style="font-weight: 600; font-size: 14px;">{{paymentDate}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b; font-size: 14px;">Purchased Item</span>
            <span style="font-weight: 600; font-size: 14px;">{{purchasedItem}}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #e2e8f0;">
            <span style="font-weight: 700; font-size: 14px;">Total Payment</span>
            <span style="font-weight: 700; font-size: 18px; color: #6366f1;">{{totalPayment}}</span>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="{{invoiceUrl}}" style="display: inline-block; background: #ffffff; color: #6366f1; border: 2px solid #6366f1; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-right: 8px;">View Invoice</a>
          <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-left: 8px;">Open Dashboard</a>
        </div>
      </div>
      <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">Need help? <a href="mailto:support@tamer.studio" style="color: #6366f1;">support@tamer.studio</a></p>
        <p style="font-size: 12px; color: #cbd5e1; margin: 0;">© ${new Date().getFullYear()} Tamer Studio. All rights reserved.</p>
      </div>
    </div>`,
    text: "Hi {{name}},\n\nYour payment has been confirmed!\n\nInvoice Number: {{invoiceNumber}}\nTransaction Number: {{transactionNumber}}\nPayment Method: {{paymentMethod}}\nPayment Date: {{paymentDate}}\nPurchased Item: {{purchasedItem}}\nTotal Payment: {{totalPayment}}\n\nView Invoice: {{invoiceUrl}}\nOpen Dashboard: {{dashboardUrl}}\n\n© ${new Date().getFullYear()} Tamer Studio",
    variables: ["name", "invoiceNumber", "transactionNumber", "paymentMethod", "paymentDate", "purchasedItem", "totalPayment", "invoiceUrl", "dashboardUrl"],
    isActive: true,
    version: 1,
    language: "en",
    isSystem: true,
  },
};

export class EmailTemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    Object.values(DEFAULT_TEMPLATES).forEach((t) => {
      this.templates.set(t.key, {
        ...t,
        id: `tmpl_${t.key}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as EmailTemplate);
    });
  }

  getTemplate(key: string): EmailTemplate | undefined {
    return this.templates.get(key);
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByType(type: EmailType): EmailTemplate[] {
    return this.getAllTemplates().filter((t) => t.type === type);
  }

  registerTemplate(template: EmailTemplate): void {
    this.templates.set(template.key, template);
  }

  removeTemplate(key: string): void {
    this.templates.delete(key);
  }

  render(key: string, variables: Record<string, string>): { subject: string; html: string; text?: string } | null {
    const template = this.templates.get(key);
    if (!template || !template.isActive) return null;

    let subject = template.subject;
    let html = template.html;
    let text = template.text;

    for (const [k, v] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${k}\\}\\}`, "g");
      subject = subject.replace(regex, v);
      html = html.replace(regex, v);
      if (text) text = text.replace(regex, v);
    }

    return { subject, html, text };
  }

  renderType(type: EmailType, variables: Record<string, string>): { subject: string; html: string; text?: string } | null {
    const template = this.getTemplatesByType(type).find((t) => t.isActive);
    if (!template) return null;
    return this.render(template.key, variables);
  }
}

export const emailTemplateEngine = new EmailTemplateEngine();
