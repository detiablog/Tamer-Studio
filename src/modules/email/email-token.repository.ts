import { db } from "@/lib/db";
import { emailToken } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { EmailToken, TokenType } from "./email.interface";

export class EmailTokenRepository {
  async createToken(data: {
    id: string;
    type: string;
    token: string;
    email: string;
    userId?: string;
    payload?: Record<string, unknown>;
    expiresAt: Date;
    createdAt: Date;
  }): Promise<void> {
    await db.insert(emailToken).values({
      id: data.id,
      type: data.type,
      token: data.token,
      email: data.email,
      userId: data.userId,
      payload: data.payload,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt,
    });
  }

  async findValidToken(tokenHash: string, type: TokenType): Promise<EmailToken | null> {
    const result = await db
      .select()
      .from(emailToken)
      .where(
        and(
          eq(emailToken.token, tokenHash),
          eq(emailToken.type, type),
          sql`${emailToken.expiresAt} > NOW()`
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }
    return result[0] as EmailToken;
  }

  async invalidateToken(tokenHash: string): Promise<void> {
    await db
      .update(emailToken)
      .set({ usedAt: new Date() })
      .where(eq(emailToken.token, tokenHash));
  }
}

export const emailTokenRepository = new EmailTokenRepository();
