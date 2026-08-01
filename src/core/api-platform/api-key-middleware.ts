import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema/api-platform";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = "tsk_" + crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 8);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(key: string): Promise<{ valid: boolean; keyRecord?: any; error?: string }> {
  if (!key || !key.startsWith("tsk_")) return { valid: false, error: "Invalid API key format" };
  const hash = hashApiKey(key);
  const [keyRecord] = await db.select().from(apiKey).where(and(eq(apiKey.keyHash, hash), eq(apiKey.isActive, true))).limit(1);
  if (!keyRecord) return { valid: false, error: "API key not found or inactive" };
  if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) return { valid: false, error: "API key has expired" };
  await db.update(apiKey).set({ lastUsedAt: new Date(), requestCount: sql`${apiKey.requestCount} + 1` }).where(eq(apiKey.id, keyRecord.id));
  return { valid: true, keyRecord };
}

export function hasScope(scopes: string[], requiredScope: string): boolean {
  return scopes.includes(requiredScope) || scopes.includes("*");
}
