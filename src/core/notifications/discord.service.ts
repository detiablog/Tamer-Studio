export interface DiscordProvider {
  readonly name: string;
  send(webhookUrl: string, content: string, embeds?: Record<string, unknown>[]): Promise<{ success: boolean; statusCode?: number; error?: string }>;
}

export class DiscordNotificationService {
  constructor(private provider?: DiscordProvider) {}

  async notify(webhookUrl: string, content: string, embeds?: Record<string, unknown>[]): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!this.provider) {
      return { success: false, error: "DiscordProvider not configured" };
    }
    return this.provider.send(webhookUrl, content, embeds);
  }

  async notifyWithButtons(webhookUrl: string, content: string, _buttons?: Array<{ label: string; url: string }>): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    if (!this.provider) {
      return { success: false, error: "DiscordProvider not configured" };
    }

    return this.provider.send(webhookUrl, content, [
      {
        type: "rich",
        description: content,
      },
    ]);
  }
}
