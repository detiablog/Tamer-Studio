import { db } from "@/lib/db";
import { taxRule as taxRuleTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { TaxRule } from "../types";

export interface TaxRepository {
  createTaxRule(rule: Omit<TaxRule, "id" | "createdAt" | "updatedAt">): Promise<TaxRule>;
  getTaxRule(ruleId: string): Promise<TaxRule | undefined>;
  getTaxRules(region: string): Promise<TaxRule[]>;
  listTaxRules(): Promise<TaxRule[]>;
  updateTaxRule(ruleId: string, updates: Partial<TaxRule>): Promise<TaxRule>;
}

export class DefaultTaxRepository implements TaxRepository {
  async createTaxRule(rule: Omit<TaxRule, "id" | "createdAt" | "updatedAt">): Promise<TaxRule> {
    const id = `tax_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(taxRuleTable).values({
      id,
      name: rule.name,
      region: rule.region,
      rate: String(rule.rate),
      type: rule.type,
      currency: rule.currency,
      minAmount: rule.minAmount ? String(rule.minAmount) : null,
      maxAmount: rule.maxAmount ? String(rule.maxAmount) : null,
      isActive: rule.isActive,
      priority: String(rule.priority),
      metadata: rule.metadata ?? {},
    });
    return {
      ...rule,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getTaxRule(ruleId: string): Promise<TaxRule | undefined> {
    const rows = await db.select().from(taxRuleTable).where(eq(taxRuleTable.id, ruleId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async getTaxRules(region: string): Promise<TaxRule[]> {
    const rows = await db.select().from(taxRuleTable).where(and(eq(taxRuleTable.region, region), eq(taxRuleTable.isActive, true)));
    return rows.map((row) => this.mapRow(row));
  }

  async listTaxRules(): Promise<TaxRule[]> {
    const rows = await db.select().from(taxRuleTable);
    return rows.map((row) => this.mapRow(row));
  }

  async updateTaxRule(ruleId: string, updates: Partial<TaxRule>): Promise<TaxRule> {
    const now = new Date();
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.rate !== undefined) updateData.rate = String(updates.rate);
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.priority !== undefined) updateData.priority = String(updates.priority);
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
    await db.update(taxRuleTable).set(updateData).where(eq(taxRuleTable.id, ruleId));
    const rows = await db.select().from(taxRuleTable).where(eq(taxRuleTable.id, ruleId)).limit(1);
    if (rows.length === 0) throw new Error(`Tax rule ${ruleId} not found after update`);
    return this.mapRow(rows[0]);
  }

  private mapRow(row: typeof taxRuleTable.$inferSelect): TaxRule {
    return {
      id: row.id,
      name: row.name,
      region: row.region,
      rate: Number(row.rate),
      type: row.type as TaxRule["type"],
      currency: row.currency,
      minAmount: row.minAmount ? Number(row.minAmount) : undefined,
      maxAmount: row.maxAmount ? Number(row.maxAmount) : undefined,
      isActive: row.isActive,
      priority: Number(row.priority),
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
