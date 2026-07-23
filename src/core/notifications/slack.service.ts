export interface SlackProvider {
  readonly name: string;
  send(webhookUrl: string, payload: Record<string, unknown>): Promise<{ success: boolean; statusCode?: number; error?: string }>;
}

export class SlackNotificationService {
  constructor(private provider?: SlackProvider) {}

  async notify(webhookUrl: string, text: string, blocks?: Record<string, unknown>[]): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!this.provider) {
      return { success: false, error: "SlackProvider not configured" };
    }

    const payload: Record<string, unknown> = { text };
    if (blocks && blocks.length > 0) {
      payload.blocks = blocks;
    }

    return this.provider.send(webhookUrl, payload);
  }

  async postEphemeral(webhookUrl: string, text: string, user: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!this.provider) {
      return { success: false, error: "SlackProvider not configured" };
    }

    return this.provider.send(webhookUrl, {
      text,
      channel: user,
      response_type: "ephemeral",
    });
  }

  async updateMessage(webhookUrl: string, ts: string, text: string, blocks?: Record<string, unknown>[]): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!this.provider) {
      return { success: false, error: "SlackProvider not configured" };
    }

    return this.provider.send(webhookUrl, {
      channel: webhookUrl,
      ts,
      text,
      blocks,
    });
  }
}
