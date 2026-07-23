import { describe, it, expect, vi, beforeEach } from "vitest";
import { WebhookNotificationService } from "@/core/notifications/webhook.service";
import type { WebhookProvider, WebhookMessage } from "@/core/notifications/webhook.service";

describe("WebhookNotificationService", () => {
  let service: WebhookNotificationService;
  let provider: WebhookProvider;
  let send: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    send = vi.fn();
    provider = { name: "test-provider", send: send as unknown as WebhookProvider["send"] };
    service = new WebhookNotificationService(provider);
  });

  it("sends webhook message successfully", async () => {
    send.mockResolvedValueOnce({ success: true, statusCode: 200 });

    const message: WebhookMessage = {
      url: "https://example.com/webhook",
      method: "POST",
      payload: { key: "value" },
    };

    const result = await service.send(message);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(send).toHaveBeenCalledWith(message.url, message.payload);
  });

  it("handles send failure", async () => {
    send.mockResolvedValueOnce({ success: false, error: "Not Found", statusCode: 404 });

    const message: WebhookMessage = {
      url: "https://example.com/webhook",
      method: "POST",
      payload: { key: "value" },
    };

    const result = await service.send(message);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Not Found");
  });

  it("sends batch in parallel", async () => {
    send
      .mockResolvedValueOnce({ success: true, statusCode: 200 })
      .mockResolvedValueOnce({ success: false, error: "Timeout", statusCode: 504 });

    const messages: WebhookMessage[] = [
      { url: "https://example.com/1", method: "POST", payload: { a: 1 } },
      { url: "https://example.com/2", method: "POST", payload: { b: 2 } },
    ];

    const results = await service.sendBatch(messages);
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
  });

  it("handles provider send throwing", async () => {
    send.mockRejectedValueOnce(new Error("Network error"));

    const message: WebhookMessage = {
      url: "https://example.com/webhook",
      method: "POST",
      payload: { key: "value" },
    };

    const result = await service.send(message);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
  });

  it("falls back to fetch when no provider is configured", async () => {
    const noProviderService = new WebhookNotificationService();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({}),
    } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const message: WebhookMessage = {
      url: "https://example.com/webhook",
      method: "POST",
      payload: { key: "value" },
    };

    const result = await noProviderService.send(message);
    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(message.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload),
    });
  });

  it("includes secret in X-Webhook-Secret header via fetch", async () => {
    const noProviderService = new WebhookNotificationService();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({}),
    } as Response);

    vi.stubGlobal("fetch", fetchMock);

    const message: WebhookMessage = {
      url: "https://example.com/webhook",
      method: "PUT",
      headers: { "X-Custom": "header" },
      payload: { key: "value" },
      secret: "my-secret",
    };

    const result = await noProviderService.send(message);
    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(message.url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Custom": "header",
        "X-Webhook-Secret": "my-secret",
      },
      body: JSON.stringify(message.payload),
    });
  });
});
