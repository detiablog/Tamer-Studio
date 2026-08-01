import { type NextRequest } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { apiKey } from "@/lib/db/schema/identity";
import { eq } from "drizzle-orm";
import { errorResponse } from "@/app/api/mappers/response";

export async function validateApiKey(rawKey: string) {
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const rows = await db.select().from(apiKey).where(eq(apiKey.keyHash, keyHash)).limit(1);
  if (rows.length === 0) return { valid: false, error: "Invalid API key" };
  const keyRecord = rows[0];
  if (keyRecord.isRevoked) return { valid: false, error: "API key is revoked" };
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) return { valid: false, error: "API key expired" };
  return { valid: true, keyRecord };
}

export function hasScope(keyScopes: string[], requiredScope: string): boolean {
  if (keyScopes.includes("*")) return true;
  return keyScopes.includes(requiredScope);
}

export async function withApiAuth(request: NextRequest, requiredScope?: string) {
  const authHeader = request.headers.get("Authorization");
  let apiKeyValue: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    apiKeyValue = authHeader.slice(7);
  } else {
    apiKeyValue = request.headers.get("X-API-Key");
  }
  if (!apiKeyValue) return { authenticated: false as const, response: errorResponse("UNAUTHORIZED", "API key required") };
  const result = await validateApiKey(apiKeyValue);
  if (!result.valid) return { authenticated: false as const, response: errorResponse("UNAUTHORIZED", result.error ?? "Invalid API key") };
  if (requiredScope && !hasScope((result.keyRecord?.scopes as string[]) ?? [], requiredScope)) {
    return { authenticated: false as const, response: errorResponse("FORBIDDEN", "Insufficient permissions") };
  }
  return { authenticated: true as const, keyRecord: result.keyRecord! };
}
