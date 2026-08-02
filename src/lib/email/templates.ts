export type TemplateType =
  | "verification"
  | "reset_password"
  | "payment_success"
  | "welcome"
  | "credits_purchased"
  | "subscription"
  | "affiliate_approval"
  | "affiliate_rejected"
  | "invoice"
  | "contact_form"
  | "support_reply"
  | "announcement"
  | "subscription_expired"
  | "test";

export interface EmailTemplateDef {
  key: string;
  name: string;
  type: TemplateType;
  subject: string;
  html: string;
  text: string;
  variables: string[];
}

const SITE_NAME = "Tamer Studio";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "";
const SUPPORT_EMAIL = "support@tamerstudio.com";

const baseLayout = (content: string) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
<div style="text-align:center;padding:40px 0;">
<h1 style="font-size:28px;font-weight:700;margin:0 0 8px 0;color:#1a1a2e;">{{title}}</h1>
<p style="font-size:16px;color:#64748b;margin:0;">${SITE_NAME} - AI Creative Platform</p>
</div>
<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:40px;margin:24px 0;">
${content}
</div>
<div style="text-align:center;padding:24px 0;border-top:1px solid #e2e8f0;">
<p style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;">Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#6366f1;">${SUPPORT_EMAIL}</a></p>
<p style="font-size:12px;color:#cbd5e1;margin:0;">© {{current_year}} ${SITE_NAME}. All rights reserved.</p>
</div>
</div>
</body>
</html>`;

const textFooter = `\n\nNeed help? ${SUPPORT_EMAIL}\n© {{current_year}} ${SITE_NAME}. All rights reserved.`;

export const SAMPLE_VARIABLES: Record<string, string> = {
  name: "John Doe",
  email: "john@example.com",
  site_name: SITE_NAME,
  support_email: SUPPORT_EMAIL,
  current_year: String(new Date().getFullYear()),
  verification_url: `${SITE_URL}/verify-email?token=sample-token`,
  reset_url: `${SITE_URL}/reset-password?token=sample-token`,
  invoice_number: "INV-2026-001",
  transaction_number: "TXN-2026-001",
  payment_method: "Credit Card",
  payment_date: "July 30, 2026",
  purchased_item: "Pro Plan - Monthly",
  total_payment: "$29.99",
  invoice_url: `${SITE_URL}/invoices/sample`,
  dashboard_url: `${SITE_URL}/dashboard`,
  plan_name: "Pro Plan",
  credits_amount: "500",
  credits_balance: "1,200",
  subscription_status: "Active",
  renewal_date: "August 30, 2026",
  affiliate_name: "John Doe",
  affiliate_code: "AFF-001",
  commission_rate: "20%",
  cancel_url: `${SITE_URL}/subscription/cancel`,
  resubscribe_url: `${SITE_URL}/subscription/resubscribe`,
  expiry_date: "July 30, 2026",
  ticket_id: "TK-001",
  reply_message: "Thank you for contacting us. We have reviewed your inquiry and...",
  reply_url: `${SITE_URL}/support/tickets/TK-001`,
  announcement_title: "New Feature Release",
  announcement_body: "We are excited to announce a major platform update.",
  announcement_url: `${SITE_URL}/announcements/latest`,
  contact_name: "John Doe",
  contact_email: "john@example.com",
  contact_subject: "General Inquiry",
  contact_message: "I would like to know more about your services.",
  admin_dashboard_url: `${SITE_URL}/admin/dashboard`,
  reason: "Your content did not meet our affiliate program guidelines.",
  application_url: `${SITE_URL}/affiliate/apply`,
};

export const VALID_VARIABLES: Record<string, string> = {
  name: "Recipient's display name",
  email: "Recipient's email address",
  site_name: "Site/brand name",
  support_email: "Support contact email",
  current_year: "Current year for copyright",
  verification_url: "Email verification link",
  reset_url: "Password reset link",
  invoice_number: "Invoice number",
  transaction_number: "Payment transaction number",
  payment_method: "Payment method used",
  payment_date: "Date of payment",
  purchased_item: "Item/plan purchased",
  total_payment: "Total payment amount",
  invoice_url: "Link to view invoice",
  dashboard_url: "Link to user dashboard",
  plan_name: "Subscription plan name",
  credits_amount: "Number of credits added",
  credits_balance: "Remaining credits balance",
  subscription_status: "Current subscription status",
  renewal_date: "Next renewal date",
  affiliate_name: "Affiliate partner name",
  affiliate_code: "Affiliate referral code",
  commission_rate: "Affiliate commission percentage",
  cancel_url: "Subscription cancellation link",
  resubscribe_url: "Link to resubscribe",
  expiry_date: "Date when subscription expired",
  ticket_id: "Support ticket ID",
  reply_message: "Support reply message content",
  reply_url: "Link to view ticket reply",
  announcement_title: "Announcement headline",
  announcement_body: "Announcement content body",
  announcement_url: "Link to full announcement",
  contact_name: "Contact form submitter name",
  contact_email: "Contact form submitter email",
  contact_subject: "Contact form subject",
  contact_message: "Contact form message content",
  admin_dashboard_url: "Admin dashboard link",
  reason: "Rejection reason text",
  application_url: "Affiliate application link",
};

const TEMPLATES: EmailTemplateDef[] = [
  {
    key: "verification",
    name: "Email Verification",
    type: "verification",
    subject: "Verify your {{site_name}} account",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Welcome to ${SITE_NAME}! Please verify your email address to activate your account and start building.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{verification_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Verify Email Address</a>
      </div>
      <p style="font-size:14px;color:#94a3b8;margin:0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `).replace("{{title}}", "Verify Your Email"),
    text: "Hi {{name}},\n\nWelcome to ${SITE_NAME}! Please verify your email by clicking: {{verification_url}}\n\nThis link expires in 24 hours." + textFooter,
    variables: ["name", "verification_url", "site_name"],
  },
  {
    key: "reset_password",
    name: "Password Reset",
    type: "reset_password",
    subject: "Reset your {{site_name}} password",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{reset_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Reset Password</a>
      </div>
      <p style="font-size:14px;color:#94a3b8;margin:0;">If you didn't request this, you can safely ignore this email.</p>
    `).replace("{{title}}", "Reset Your Password"),
    text: "Hi {{name}},\n\nWe received a request to reset your password. Click: {{reset_url}}\n\nThis link expires in 30 minutes." + textFooter,
    variables: ["name", "reset_url", "site_name"],
  },
  {
    key: "payment_success",
    name: "Payment Success & Invoice",
    type: "payment_success",
    subject: "Payment confirmed - Invoice {{invoice_number}}",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Your payment has been confirmed! Here are your invoice details:</p>
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Invoice Number</span><span style="font-weight:600;font-size:14px;">{{invoice_number}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Transaction Number</span><span style="font-weight:600;font-size:14px;">{{transaction_number}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Payment Method</span><span style="font-weight:600;font-size:14px;">{{payment_method}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Payment Date</span><span style="font-weight:600;font-size:14px;">{{payment_date}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Purchased Item</span><span style="font-weight:600;font-size:14px;">{{purchased_item}}</span></div>
        <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #e2e8f0;"><span style="font-weight:700;font-size:14px;">Total Payment</span><span style="font-weight:700;font-size:18px;color:#6366f1;">{{total_payment}}</span></div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{invoice_url}}" style="display:inline-block;background:#ffffff;color:#6366f1;border:2px solid #6366f1;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;margin-right:8px;">View Invoice</a>
        <a href="{{dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;margin-left:8px;">Open Dashboard</a>
      </div>
    `).replace("{{title}}", "Payment Successful"),
    text: "Hi {{name}},\n\nPayment confirmed!\nInvoice: {{invoice_number}}\nTransaction: {{transaction_number}}\nMethod: {{payment_method}}\nDate: {{payment_date}}\nItem: {{purchased_item}}\nTotal: {{total_payment}}\n\nView Invoice: {{invoice_url}}" + textFooter,
    variables: ["name", "invoice_number", "transaction_number", "payment_method", "payment_date", "purchased_item", "total_payment", "invoice_url", "dashboard_url"],
  },
  {
    key: "welcome",
    name: "Welcome Email",
    type: "welcome",
    subject: "Welcome to {{site_name}}, {{name}}!",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Welcome to ${SITE_NAME}! We're excited to have you on board. Your account is now active and ready to use.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="font-size:14px;color:#166534;margin:0;">Here are some things you can do to get started:</p>
        <ul style="font-size:14px;color:#166534;margin:8px 0 0 20px;padding:0;">
          <li style="margin-bottom:4px;">Complete your profile</li>
          <li style="margin-bottom:4px;">Create your first project</li>
          <li style="margin-bottom:4px;">Explore AI-powered tools</li>
          <li>Join our community</li>
        </ul>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Go to Dashboard</a>
      </div>
    `).replace("{{title}}", "Welcome to " + SITE_NAME),
    text: "Hi {{name}},\n\nWelcome to ${SITE_NAME}! Your account is now active.\n\nGet started:\n- Complete your profile\n- Create your first project\n- Explore AI-powered tools\n\nGo to Dashboard: {{dashboard_url}}" + textFooter,
    variables: ["name", "site_name", "dashboard_url"],
  },
  {
    key: "credits_purchased",
    name: "Credits Purchased",
    type: "credits_purchased",
    subject: "{{credits_amount}} credits added to your account",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Your credits purchase has been processed successfully!</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
        <p style="font-size:14px;color:#166534;margin:0 0 8px 0;">Credits Added</p>
        <p style="font-size:32px;font-weight:700;color:#166534;margin:0 0 8px 0;">+{{credits_amount}}</p>
        <p style="font-size:14px;color:#166534;margin:0;">New Balance: {{credits_balance}} credits</p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">View Dashboard</a>
      </div>
    `).replace("{{title}}", "Credits Purchased"),
    text: "Hi {{name}},\n\nYour credits purchase was successful!\nCredits Added: +{{credits_amount}}\nNew Balance: {{credits_balance}} credits\n\nView Dashboard: {{dashboard_url}}" + textFooter,
    variables: ["name", "credits_amount", "credits_balance", "dashboard_url"],
  },
  {
    key: "subscription",
    name: "Subscription Confirmation",
    type: "subscription",
    subject: "Your {{plan_name}} subscription is active",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Your subscription to <strong>{{plan_name}}</strong> is now active!</p>
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Plan</span><span style="font-weight:600;font-size:14px;">{{plan_name}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Status</span><span style="font-weight:600;font-size:14px;color:#16a34a;">{{subscription_status}}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#64748b;font-size:14px;">Next Renewal</span><span style="font-weight:600;font-size:14px;">{{renewal_date}}</span></div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Manage Subscription</a>
      </div>
    `).replace("{{title}}", "Subscription Active"),
    text: "Hi {{name}},\n\nYour {{plan_name}} subscription is active!\nStatus: {{subscription_status}}\nNext Renewal: {{renewal_date}}\n\nManage Subscription: {{dashboard_url}}" + textFooter,
    variables: ["name", "plan_name", "subscription_status", "renewal_date", "dashboard_url"],
  },
  {
    key: "affiliate_approval",
    name: "Affiliate Approval",
    type: "affiliate_approval",
    subject: "Your affiliate application has been approved!",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{affiliate_name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Great news! Your affiliate application has been approved. You can now start earning commissions by referring new users to ${SITE_NAME}.</p>
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="font-size:14px;color:#92400e;margin:0 0 8px 0;font-weight:600;">Your Affiliate Details</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#92400e;font-size:14px;">Affiliate Code</span><span style="font-weight:600;font-size:14px;">{{affiliate_code}}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="color:#92400e;font-size:14px;">Commission Rate</span><span style="font-weight:600;font-size:14px;">{{commission_rate}}</span></div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">View Affiliate Dashboard</a>
      </div>
    `).replace("{{title}}", "Affiliate Approved"),
    text: "Hi {{affiliate_name}},\n\nYour affiliate application has been approved!\nAffiliate Code: {{affiliate_code}}\nCommission Rate: {{commission_rate}}\n\nView Dashboard: {{dashboard_url}}" + textFooter,
    variables: ["affiliate_name", "affiliate_code", "commission_rate", "dashboard_url"],
  },
  {
    key: "subscription_expired",
    name: "Subscription Expired",
    type: "subscription_expired",
    subject: "Your {{site_name}} subscription has expired",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Your <strong>{{plan_name}}</strong> subscription has expired on {{expiry_date}}. Some features may be limited until you renew.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="font-size:14px;color:#991b1b;margin:0 0 8px 0;font-weight:600;">What happens now?</p>
        <ul style="font-size:14px;color:#991b1b;margin:8px 0 0 20px;padding:0;">
          <li style="margin-bottom:4px;">AI generation credits are paused</li>
          <li style="margin-bottom:4px;">Projects remain saved</li>
          <li style="margin-bottom:4px;">Re-subscribe anytime to restore access</li>
        </ul>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{resubscribe_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Renew Subscription</a>
      </div>
    `).replace("{{title}}", "Subscription Expired"),
    text: "Hi {{name}},\n\nYour {{plan_name}} subscription has expired on {{expiry_date}}.\n\nWhat happens now:\n- AI generation credits are paused\n- Projects remain saved\n- Re-subscribe anytime to restore access\n\nRenew: {{resubscribe_url}}" + textFooter,
    variables: ["name", "plan_name", "expiry_date", "resubscribe_url", "site_name"],
  },
  {
    key: "affiliate_rejected",
    name: "Affiliate Rejected",
    type: "affiliate_rejected",
    subject: "Your affiliate application update",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{affiliate_name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Thank you for your interest in our affiliate program. After reviewing your application, we are unable to approve it at this time.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="font-size:14px;color:#991b1b;margin:0 0 8px 0;font-weight:600;">Reason</p>
        <p style="font-size:14px;color:#991b1b;margin:0;">{{reason}}</p>
      </div>
      <p style="font-size:14px;color:#64748b;margin:0 0 24px 0;">You are welcome to reapply after addressing the above. If you have questions, please contact us.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{application_url}}" style="display:inline-block;background:#ffffff;color:#6366f1;border:2px solid #6366f1;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;margin-right:8px;">Reapply</a>
        <a href="{{dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;margin-left:8px;">Dashboard</a>
      </div>
    `).replace("{{title}}", "Affiliate Application Update"),
    text: "Hi {{affiliate_name}},\n\nYour affiliate application was not approved at this time.\nReason: {{reason}}\n\nYou are welcome to reapply after addressing the above.\nReapply: {{application_url}}" + textFooter,
    variables: ["affiliate_name", "reason", "application_url", "dashboard_url"],
  },
  {
    key: "invoice",
    name: "Invoice",
    type: "invoice",
    subject: "Invoice {{invoice_number}} from {{site_name}}",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Please find your invoice details below:</p>
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Invoice Number</span><span style="font-weight:600;font-size:14px;">{{invoice_number}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Date</span><span style="font-weight:600;font-size:14px;">{{payment_date}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Item</span><span style="font-weight:600;font-size:14px;">{{purchased_item}}</span></div>
        <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:2px solid #e2e8f0;"><span style="font-weight:700;font-size:14px;">Total</span><span style="font-weight:700;font-size:18px;color:#6366f1;">{{total_payment}}</span></div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{invoice_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Download Invoice</a>
      </div>
    `).replace("{{title}}", "Your Invoice"),
    text: "Hi {{name}},\n\nInvoice: {{invoice_number}}\nDate: {{payment_date}}\nItem: {{purchased_item}}\nTotal: {{total_payment}}\n\nDownload: {{invoice_url}}" + textFooter,
    variables: ["name", "invoice_number", "payment_date", "purchased_item", "total_payment", "invoice_url", "site_name"],
  },
  {
    key: "contact_form",
    name: "Contact Form Submission",
    type: "contact_form",
    subject: "New contact form submission from {{name}}",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">A new contact form submission has been received:</p>
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Name</span><span style="font-weight:600;font-size:14px;">{{contact_name}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Email</span><span style="font-weight:600;font-size:14px;">{{contact_email}}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="color:#64748b;font-size:14px;">Subject</span><span style="font-weight:600;font-size:14px;">{{contact_subject}}</span></div>
        <div style="margin-top:12px;"><p style="color:#64748b;font-size:14px;margin:0 0 8px 0;">Message:</p><p style="font-size:14px;color:#334155;margin:0;white-space:pre-wrap;">{{contact_message}}</p></div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{admin_dashboard_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">View in Admin Panel</a>
      </div>
    `).replace("{{title}}", "New Contact Submission"),
    text: "New contact form submission:\nName: {{contact_name}}\nEmail: {{contact_email}}\nSubject: {{contact_subject}}\n\nMessage:\n{{contact_message}}\n\nView: {{admin_dashboard_url}}",
    variables: ["contact_name", "contact_email", "contact_subject", "contact_message", "admin_dashboard_url", "name"],
  },
  {
    key: "support_reply",
    name: "Support Reply",
    type: "support_reply",
    subject: "Support reply for your ticket #{{ticket_id}}",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">We have a reply for your support ticket <strong>#{{ticket_id}}</strong>:</p>
      <div style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="font-size:15px;color:#334155;margin:0;white-space:pre-wrap;line-height:1.6;">{{reply_message}}</p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{reply_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">View Full Conversation</a>
      </div>
    `).replace("{{title}}", "Support Reply"),
    text: "Hi {{name}},\n\nSupport reply for ticket #{{ticket_id}}:\n\n{{reply_message}}\n\nView conversation: {{reply_url}}" + textFooter,
    variables: ["name", "ticket_id", "reply_message", "reply_url"],
  },
  {
    key: "announcement",
    name: "Announcement",
    type: "announcement",
    subject: "New announcement from {{site_name}}",
    html: baseLayout(`
      <p style="font-size:16px;line-height:1.6;color:#334155;margin:0 0 24px 0;">Hi {{name}},</p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;margin:24px 0;">
        <h2 style="font-size:20px;font-weight:700;color:#1e40af;margin:0 0 12px 0;">{{announcement_title}}</h2>
        <p style="font-size:15px;color:#1e3a5f;margin:0;line-height:1.6;">{{announcement_body}}</p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{announcement_url}}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:600;">Read More</a>
      </div>
    `).replace("{{title}}", "Announcement"),
    text: "Hi {{name}},\n\nAnnouncement: {{announcement_title}}\n\n{{announcement_body}}\n\nRead more: {{announcement_url}}" + textFooter,
    variables: ["name", "announcement_title", "announcement_body", "announcement_url", "site_name"],
  },
];

export function getTemplates(): EmailTemplateDef[] {
  return TEMPLATES;
}

export function getTemplateByKey(key: string): EmailTemplateDef | undefined {
  return TEMPLATES.find((t) => t.key === key);
}

export function getTemplatesByType(type: TemplateType): EmailTemplateDef[] {
  return TEMPLATES.filter((t) => t.type === type);
}

export function renderTemplate(
  template: EmailTemplateDef,
  variables: Record<string, string>
): { subject: string; html: string; text: string } {
  const allVars = { ...SAMPLE_VARIABLES, ...variables };
  let subject = template.subject;
  let html = template.html;
  let text = template.text;

  for (const [key, value] of Object.entries(allVars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
    text = text.replace(regex, value);
  }

  return { subject, html, text };
}

export function previewTemplate(key: string): { subject: string; html: string; text: string } | null {
  const template = getTemplateByKey(key);
  if (!template) return null;
  return renderTemplate(template, SAMPLE_VARIABLES);
}

export function getSampleVariables(): Record<string, string> {
  return { ...SAMPLE_VARIABLES };
}

export function validateTemplateVariables(
  html: string,
  subject: string
): { valid: boolean; found: string[]; unknown: string[] } {
  const regex = /\{\{(\w+)\}\}/g;
  const found = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    found.add(match[1]);
  }
  regex.lastIndex = 0;
  while ((match = regex.exec(subject)) !== null) {
    found.add(match[1]);
  }

  const foundArray = Array.from(found);
  const unknown = foundArray.filter((v) => !(v in VALID_VARIABLES));

  return {
    valid: unknown.length === 0,
    found: foundArray,
    unknown,
  };
}

export const TEMPLATE_CATEGORIES = [
  { key: "authentication", name: "Authentication" },
  { key: "billing", name: "Billing" },
  { key: "marketing", name: "Marketing" },
  { key: "notification", name: "Notification" },
  { key: "support", name: "Support" },
  { key: "affiliate", name: "Affiliate" },
  { key: "system", name: "System" },
  { key: "announcement", name: "Announcement" },
] as const;
