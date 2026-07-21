import { db } from "@/lib/db";
import { adminSession } from "@/lib/db/schema";
import { logger } from "@/core/logger";
import { eq } from "drizzle-orm";

export async function logoutAdmin(sessionId: string): Promise<void> {
  const sessions = await db.select().from(adminSession).where(eq(adminSession.id, sessionId)).limit(1);
  
  if (sessions.length > 0) {
    await db.delete(adminSession).where(eq(adminSession.id, sessionId));
    logger.audit("Admin logged out", { sessionId });
  }
}
