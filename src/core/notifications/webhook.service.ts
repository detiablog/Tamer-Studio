export interface WebhookProvider {
  readonly name: string;
  send(url: string, payload: Record<string, unknown>): Promise<{ success: boolean; statusCode?: number; error?: string }>;
}

export interface WebhookMessage {
  url: string;
  method: "POST" | "PUT";
  headers?: Record<string, string>;
  payload: Record<string, unknown>;
  secret?: string;
}

export class WebhookNotificationService {
  constructor(private provider?: WebhookProvider) {}

  async send(message: WebhookMessage): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (this.provider) {
      try {
        return await this.provider.send(message.url, message.payload);
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...message.headers,
      };

      if (message.secret) {
        headers["X-Webhook-Secret"] = message.secret;
      }

      const response = await fetch(message.url, {
        method: message.method,
        headers,
        body: JSON.stringify(message.payload),
      });

      const statusCode = response.status;

      return {
        success: response.ok,
        statusCode,
        error: response.ok ? undefined : `HTTP ${statusCode}: ${response.statusText}`,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async sendBatch(messages: WebhookMessage[]): Promise<Array<{ success: boolean; statusCode?: number; error?: string }>> {
    const results = await Promise.allSettled(messages.map((m) => this.send(m)));
    return results.map((result) =>
      result.status === "fulfilled" ? result.value : { success: false, error: String(result.reason) }
    );
  }
}
