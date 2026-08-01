import { db } from "@/lib/db";
import { promptVariables } from "@/lib/db/schema/prompt-intelligence";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export const DEFAULT_VARIABLES: Record<string, string> = {
  brand_name: "Tamer Studio",
  product_name: "Product",
  target_audience: "General audience",
  language: "English",
  cta: "Learn more",
  platform: "",
  character_name: "",
  story_theme: "",
  thumbnail_style: "",
};

export class PromptVariableService {
  async listVariables(userId: string, filters?: { search?: string; category?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 200);
    const offset = (page - 1) * limit;
    const conditions = [eq(promptVariables.userId, userId)];
    if (filters?.search) conditions.push(like(promptVariables.name, `%${filters.search}%`));
    if (filters?.category) conditions.push(eq(promptVariables.category, filters.category));
    const where = and(...conditions);
    const [data, total] = await Promise.all([
      db.select().from(promptVariables).where(where).orderBy(promptVariables.name).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(promptVariables).where(where),
    ]);
    return { data, total: Number(total[0]?.count ?? 0), page, limit };
  }

  async createVariable(userId: string, data: { name: string; key: string; value: string; description?: string; category?: string }) {
    const id = generateId("pvar");
    return db.insert(promptVariables).values({ ...data, id, userId }).returning().then(r => r[0]);
  }

  async getVariable(id: string) {
    const [item] = await db.select().from(promptVariables).where(eq(promptVariables.id, id)).limit(1);
    return item || null;
  }

  async updateVariable(id: string, data: Record<string, unknown>) {
    return db.update(promptVariables).set(data).where(eq(promptVariables.id, id)).returning().then(r => r[0]);
  }

  async deleteVariable(id: string) {
    await db.delete(promptVariables).where(eq(promptVariables.id, id));
  }

  async renderVariables(prompt: string, variables: Record<string, string>): Promise<{ rendered: string; unresolved: string[]; used: string[] }> {
    const used: string[] = [];
    const variablePattern = /\{\{\s*([\w.]+)\s*\}\}/g;
    const resolved = new Set<string>();
    const unresolvedSet = new Set<string>();

    const rendered = prompt.replace(variablePattern, (match, key: string) => {
      if (!used.includes(key)) used.push(key);
      const value = variables[key] ?? DEFAULT_VARIABLES[key];
      if (value !== undefined && value !== "") {
        resolved.add(key);
        return value;
      }
      unresolvedSet.add(key);
      return match;
    });

    const final = rendered.replace(variablePattern, (match, key: string) => {
      if (variables[key] !== undefined) return variables[key];
      return match;
    });

    return { rendered: final, unresolved: Array.from(unresolvedSet), used };
  }

  extractVariables(prompt: string): string[] {
    const matches = [...new Set(prompt.match(/\{\{\s*([\w.]+)\s*\}\}/g) || [])];
    return matches.map(m => m.replace(/\{\{\s*|\s*\}\}/g, ""));
  }

  async resolveVariableValues(userId: string, keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const rows = await db.select().from(promptVariables).where(and(eq(promptVariables.userId, userId), sql`${promptVariables.key} IN (${sql.join(keys.map(k => sql`${k}`), sql`, `)})`));
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async getStats(userId: string) {
    const [totalVariables] = await db.select({ count: sql<number>`count(*)` }).from(promptVariables).where(eq(promptVariables.userId, userId));
    return { totalVariables: Number(totalVariables?.count ?? 0) };
  }
}

export const promptVariableService = new PromptVariableService();
