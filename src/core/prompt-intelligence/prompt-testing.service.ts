import { db } from "@/lib/db";
import { promptTests } from "@/lib/db/schema/prompt-intelligence";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { promptAnalyzerService } from "./prompt-analyzer.service";

export interface TestEstimate {
  estimatedTokens: number;
  estimatedCredits: number;
}

export class PromptTestingService {
  async estimate(prompt: string): Promise<TestEstimate> {
    const analysis = await promptAnalyzerService.analyze(prompt);
    return {
      estimatedTokens: analysis.estimatedTokens,
      estimatedCredits: Math.ceil(analysis.estimatedTokens * 0.02),
    };
  }

  async listTests(userId: string, filters?: { promptId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(promptTests.userId, userId)];
    if (filters?.promptId) conditions.push(eq(promptTests.promptId, filters.promptId));
    if (filters?.status) conditions.push(eq(promptTests.status, filters.status));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(promptTests).where(where).orderBy(desc(promptTests.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(promptTests).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createTest(userId: string, data: { promptId?: string; versionNumber?: number; testName: string; resolvedPrompt: string; provider?: string; model?: string; estimatedTokens?: number; estimatedCredits?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("ptest");
    return db.insert(promptTests).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getTest(id: string) {
    const [item] = await db.select().from(promptTests).where(eq(promptTests.id, id)).limit(1);
    return item || null;
  }

  async updateTest(id: string, data: Record<string, unknown>) {
    return db.update(promptTests).set(data).where(eq(promptTests.id, id)).returning().then(r => r[0]);
  }

  async deleteTest(id: string) {
    await db.delete(promptTests).where(eq(promptTests.id, id));
  }

  async getStats(userId: string) {
    const [totalTests] = await db.select({ count: sql<number>`count(*)` }).from(promptTests).where(eq(promptTests.userId, userId));
    const [completedTests] = await db.select({ count: sql<number>`count(*)` }).from(promptTests).where(and(eq(promptTests.userId, userId), eq(promptTests.status, "completed")));
    return { totalTests: Number(totalTests?.count ?? 0), completedTests: Number(completedTests?.count ?? 0) };
  }
}

export const promptTestingService = new PromptTestingService();
