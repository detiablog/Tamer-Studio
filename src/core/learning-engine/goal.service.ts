import { db } from "@/lib/db";
import { learningGoal } from "@/lib/db/schema/learning-engine";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class GoalService {
  async listGoals(userId: string, filters?: { status?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [eq(learningGoal.userId, userId)];
    if (filters?.status) conditions.push(eq(learningGoal.status, filters.status));
    if (filters?.category) conditions.push(eq(learningGoal.category, filters.category));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(learningGoal).where(where).orderBy(desc(learningGoal.priority), desc(learningGoal.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(learningGoal).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createGoal(userId: string, data: { name: string; description?: string; category: string; targetValue?: number; unit?: string; priority?: number }) {
    const id = generateId("lgoal");
    return db.insert(learningGoal).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getGoal(id: string) {
    const [item] = await db.select().from(learningGoal).where(eq(learningGoal.id, id)).limit(1);
    return item || null;
  }

  async updateGoal(id: string, data: Record<string, unknown>) {
    return db.update(learningGoal).set(data).where(eq(learningGoal.id, id)).returning().then(r => r[0]);
  }

  async deleteGoal(id: string) {
    await db.delete(learningGoal).where(eq(learningGoal.id, id));
  }

  async updateGoalProgress(id: string, currentValue: number) {
    return db.update(learningGoal).set({ currentValue, updatedAt: new Date() }).where(eq(learningGoal.id, id)).returning().then(r => r[0]);
  }

  async getStats(userId: string) {
    const [total] = await db.select({ count: sql<number>`count(*)` }).from(learningGoal).where(eq(learningGoal.userId, userId));
    const [active] = await db.select({ count: sql<number>`count(*)` }).from(learningGoal).where(and(eq(learningGoal.userId, userId), eq(learningGoal.status, "active")));
    const [completed] = await db.select({ count: sql<number>`count(*)` }).from(learningGoal).where(and(eq(learningGoal.userId, userId), eq(learningGoal.status, "completed")));
    return { totalGoals: Number(total?.count ?? 0), activeGoals: Number(active?.count ?? 0), completedGoals: Number(completed?.count ?? 0) };
  }
}

export const goalService = new GoalService();
