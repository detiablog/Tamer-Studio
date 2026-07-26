export type ProviderType = "smtp" | "sendgrid" | "resend" | "amazon" | "mailgun" | "postmark" | "brevo" | "sparkpost";

export type RoutingMode = "priority" | "failover" | "round_robin" | "manual";

export type ProviderStatus = "healthy" | "warning" | "offline" | "disabled";

export type EmailStatus = "queued" | "processing" | "sent" | "delivered" | "failed" | "retry" | "bounce";

export type EmailType = "verification" | "reset_password" | "payment_success";

export type TokenType = "verification" | "reset_password";

export interface EmailMessage {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailProviderConfig {
  type: ProviderType;
  name: string;
  description?: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  timeout?: number;
  retryCount?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  webhookSecret?: string;
  domain?: string;
  credentials: Record<string, unknown>;
}

export interface EmailProviderHealth {
  id: string;
  providerId: string;
  status: ProviderStatus;
  latencyMs?: number;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  consecutiveFailures: number;
  errorMessage?: string;
  errorCode?: string;
  checkedAt: Date;
}

export interface EmailQueueItem {
  id: string;
  type: EmailType;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
  status: EmailStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  response?: Record<string, unknown>;
  providerId?: string;
  providerName?: string;
  latencyMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  queueId?: string;
  type: EmailType;
  to: string;
  subject: string;
  from?: string;
  replyTo?: string;
  providerId?: string;
  providerName?: string;
  status: EmailStatus;
  attempts: number;
  latencyMs?: number;
  responseCode?: number;
  responseMessage?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface EmailToken {
  id: string;
  type: TokenType;
  token: string;
  email: string;
  userId?: string;
  payload?: Record<string, unknown>;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  type: EmailType;
  subject: string;
  html: string;
  text?: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface EmailStatistics {
  id: string;
  providerId?: string;
  date: Date;
  sent: number;
  delivered: number;
  failed: number;
  retry: number;
  bounce: number;
  avgLatencyMs?: number;
  quotaUsed: number;
  quotaTotal: number;
}

export interface EmailProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly status: ProviderStatus;
  readonly isActive: boolean;
  readonly priority: number;
  config: EmailProviderConfig;
  send(message: EmailMessage): Promise<EmailResult>;
  validate(): Promise<{ success: boolean; error?: string }>;
  testConnection(): Promise<{ success: boolean; error?: string }>;
  getQuota(): Promise<{ used: number; total: number }>;
  healthCheck(): Promise<EmailProviderHealth>;
}

export interface EmailRouter {
  getProvider(messageType: EmailType): EmailProvider | null;
  getAllProviders(): EmailProvider[];
  getActiveProviders(): EmailProvider[];
  reload(): Promise<void>;
  setRoutingMode(mode: RoutingMode): void;
  getRoutingMode(): RoutingMode;
  updateProviderPriority(providerId: string, priority: number): void;
  toggleProvider(providerId: string, active: boolean): void;
}

export interface EmailQueueManager {
  enqueue(message: EmailMessage, type: EmailType, options?: { priority?: number; scheduledAt?: Date }): Promise<string>;
  dequeue(): Promise<EmailQueueItem | null>;
  ack(id: string): Promise<void>;
  nack(id: string, error: string): Promise<void>;
  getStatus(id: string): Promise<EmailStatus | null>;
  updateProgress(id: string, progress: number): Promise<void>;
  getQueueDepth(): Promise<number>;
  getFailedItems(limit?: number): Promise<EmailQueueItem[]>;
  retry(id: string): Promise<void>;
}

export interface EmailWorker {
  process(job: EmailQueueItem): Promise<EmailResult>;
  cancel?(id: string): Promise<void>;
}

export interface EmailService {
  send(message: EmailMessage, type: EmailType, options?: { priority?: number; scheduledAt?: Date }): Promise<string>;
  sendVerification(email: string, token: string, userName: string): Promise<string>;
  sendResetPassword(email: string, token: string, userName: string): Promise<string>;
  sendPaymentSuccess(data: {
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
  }): Promise<string>;
  createVerificationToken(email: string, userId?: string): Promise<string>;
  createResetPasswordToken(email: string, userId?: string, payload?: Record<string, unknown>): Promise<string>;
  verifyToken(token: string, type: TokenType): Promise<EmailToken | null>;
  invalidateToken(token: string): Promise<void>;
  getRouter(): EmailRouter;
  getQueue(): EmailQueueManager;
  getWorker(): EmailWorker;
  renderTemplate(type: EmailType, variables: Record<string, unknown>): Promise<{ subject: string; html: string; text?: string }>;
}
