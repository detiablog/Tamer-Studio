import { describe, it, expect } from "vitest";
import { InMemoryJobQueue } from "@/core/ai/services";

describe("InMemoryJobQueue", () => {
  it("enqueues and dequeues jobs", async () => {
    const queue = new InMemoryJobQueue();
    await queue.enqueue({
      id: "job-1",
      status: "queued",
      capability: "image.generate",
      payload: {},
      context: {},
      retryCount: 0,
      maxRetries: 3,
      priority: "normal",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const job = await queue.dequeue("image.generate");
    expect(job).toBeDefined();
    expect(job?.status).toBe("processing");
  });

  it("completes and fails jobs", async () => {
    const queue = new InMemoryJobQueue();
    await queue.enqueue({
      id: "job-2",
      status: "queued",
      capability: "video.generate",
      payload: {},
      context: {},
      retryCount: 0,
      maxRetries: 3,
      priority: "normal",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await queue.complete("job-2", { url: "vid.mp4" });
    expect(await queue.getStatus("job-2")).toBe("completed");

    await queue.enqueue({
      id: "job-3",
      status: "queued",
      capability: "chat.complete",
      payload: {},
      context: {},
      retryCount: 0,
      maxRetries: 3,
      priority: "normal",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await queue.fail("job-3", "error");
    expect(await queue.getStatus("job-3")).toBe("failed");
  });

  it("retries failed jobs", async () => {
    const queue = new InMemoryJobQueue();
    await queue.enqueue({
      id: "job-4",
      status: "failed",
      capability: "chat.complete",
      payload: {},
      context: {},
      retryCount: 1,
      maxRetries: 3,
      priority: "normal",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await queue.retry("job-4");
    expect(await queue.getStatus("job-4")).toBe("queued");
    expect((await queue.dequeue())?.retryCount).toBe(2);
  });
});
