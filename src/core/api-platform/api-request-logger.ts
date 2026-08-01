import { db } from "@/lib/db";
import { apiRequestLog } from "@/lib/db/schema/api-platform";
import { generateId } from "@/modules/email/email.encryption";

export async function logApiRequest(data: { apiKeyId?: string; userId: string; method: string; endpoint: string; statusCode: number; latencyMs?: number; ipAddress?: string; userAgent?: string; error?: string }) {
  try {
    await db.insert(apiRequestLog).values({
      id: generateId("req"),
      apiKeyId: data.apiKeyId || null,
      userId: data.userId,
      method: data.method,
      endpoint: data.endpoint,
      statusCode: data.statusCode,
      latencyMs: data.latencyMs || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      error: data.error || null,
    });
  } catch {}
}
