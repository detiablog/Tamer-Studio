export interface SmsMessage {
  to: string;
  body: string;
  from?: string;
  metadata?: Record<string, unknown>;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SmsProvider {
  readonly name: string;
  send(message: SmsMessage): Promise<SmsResult>;
  validate(): Promise<boolean>;
}

export interface SmsService {
  send(message: SmsMessage): Promise<SmsResult>;
  sendBatch(messages: SmsMessage[]): Promise<SmsResult[]>;
  validate(): Promise<boolean>;
}
