import { describe, it, expect, vi, beforeEach } from "vitest";
import { DiscordNotificationService } from "@/core/notifications/discord.service";
import type { DiscordProvider } from "@/core/notifications/discord.service";

describe("DiscordNotificationService", () => {
  let service: DiscordNotificationService;
  let provider: DiscordProvider;
  let send: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    send = vi.fn();
    provider = { name: "discord", send: send as unknown as DiscordProvider["send"] };
    service = new DiscordNotificationService(provider);
  });

  it("notifies via provider", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 204 });

    const result = await service.notify("https://discord.com/api/webhooks/123", "Hello", []);
    expect(result.success).toBe(true);
    expect(send).toHaveBeenCalledWith("https://discord.com/api/webhooks/123", "Hello", []);
  });

  it("returns error when provider is not configured", async () => {
    const bareService = new DiscordNotificationService();
    const result = await bareService.notify("https://discord.com/api/webhooks/123", "Hello");
    expect(result.success).toBe(false);
    expect(result.error).toBe("DiscordProvider not configured");
  });

  it("notifies with buttons when configured", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 204 });

    await service.notifyWithButtons("https://discord.com/api/webhooks/123", "Hello", [
      { label: "Click me", url: "https://example.com" },
    ]);

    expect(send).toHaveBeenCalledWith("https://discord.com/api/webhooks/123", "Hello", [
      {
        type: "rich",
        description: "Hello",
      },
    ]);
  });
});
