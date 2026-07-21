export interface MailMessage {
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

export interface MailResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface MailProvider {
  readonly name: string;
  send(message: MailMessage): Promise<MailResult>;
  validate(): Promise<boolean>;
}

export interface MailService {
  send(message: MailMessage): Promise<MailResult>;
  sendBatch(messages: MailMessage[]): Promise<MailResult[]>;
  validate(): Promise<boolean>;
}
