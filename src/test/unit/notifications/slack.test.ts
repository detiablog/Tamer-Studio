import { describe, it, expect, vi, beforeEach } from "vitest";
import { SlackNotificationService } from "@/core/notifications/slack.service";
import type { SlackProvider } from "@/core/notifications/slack.service";

describe("SlackNotificationService", () => {
  let service: SlackNotificationService;
  let provider: SlackProvider;
  let send: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    send = vi.fn();
    provider = { name: "slack", send: send as unknown as SlackProvider["send"] };
    service = new SlackNotificationService(provider);
  });

  it("notifies via provider with text", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 200 });

    const result = await service.notify("https://hooks.slack.com/services/123", "Hello Slack");
    expect(result.success).toBe(true);
    expect(send).toHaveBeenCalledWith("https://hooks.slack.com/services/123", { text: "Hello Slack" });
  });

  it("includes blocks when provided", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 200 });

    const blocks = [{ type: "section", text: { type: "plain_text", text: "Hello" } }];
    await service.notify("https://hooks.slack.com/services/123", "Hello", blocks);

    expect(send).toHaveBeenCalledWith("https://hooks.slack.com/services/123", {
      text: "Hello",
      blocks,
    });
  });

  it("returns error when provider is not configured", async () => {
    const bareService = new SlackNotificationService();
    const result = await bareService.notify("https://hooks.slack.com/services/123", "Hello");
    expect(result.success).toBe(false);
    expect(result.error).toBe("SlackProvider not configured");
  });

  it("posts ephemeral message", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 200 });

    await service.postEphemeral("https://hooks.slack.com/services/123", "Hey you", "@user");

    expect(send).toHaveBeenCalledWith("https://hooks.slack.com/services/123", {
      text: "Hey you",
      channel: "@user",
      response_type: "ephemeral",
    });
  });

  it("updates message", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 200 });

    await service.updateMessage("https://hooks.slack.com/services/123", "ts-123", "Updated text");

    expect(send).toHaveBeenCalledWith("https://hooks.slack.com/services/123", {
      channel: "https://hooks.slack.com/services/123",
      ts: "ts-123",
      text: "Updated text",
      blocks: undefined,
    });
  });
});
