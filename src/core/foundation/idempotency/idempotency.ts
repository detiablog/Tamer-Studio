export interface IdempotencyEntry {
  key: string;
  status: "pending" | "completed" | "failed";
  requestHash: string;
  response?: unknown;
  createdAt: number;
  expiresAt: number;
}

export class IdempotencyKeyManager {
  private store = new Map<string, IdempotencyEntry>();
  private defaultTtlMs = 3600000;

  generate(prefix?: string): string {
    const raw = `${prefix ? prefix + "-" : ""}${crypto.randomUUID()}`;
    return raw;
  }

  async consume(key: string, requestHash: string): Promise<boolean> {
    const existing = this.store.get(key);
    if (existing) {
      if (existing.requestHash === requestHash && existing.status === "pending") {
        return true;
      }
      if (existing.status === "completed" || existing.status === "failed") {
        return false;
      }
    }
    this.store.set(key, {
      key,
      status: "pending",
      requestHash,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.defaultTtlMs,
    });
    return true;
  }

  async complete(key: string, response?: unknown): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.status = "completed";
      entry.response = response;
    }
  }

  async clear(expiredOnly = true): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (!expiredOnly || entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }
}

export const idempotencyKeyManager = new IdempotencyKeyManager();