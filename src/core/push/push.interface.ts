export interface PushMessage {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
  sound?: string;
  metadata?: Record<string, unknown>;
}

export interface PushResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PushProvider {
  readonly name: string;
  send(message: PushMessage): Promise<PushResult>;
  validate(): Promise<boolean>;
}

export interface PushService {
  send(message: PushMessage): Promise<PushResult>;
  sendBatch(messages: PushMessage[]): Promise<PushResult[]>;
  validate(): Promise<boolean>;
}
