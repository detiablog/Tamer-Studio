import { db } from "@/lib/db";
import { voucher as voucherTable, voucherUsage as voucherUsageTable } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { Voucher, VoucherUsage } from "../types";

export interface VoucherRepository {
  createVoucher(voucher: Omit<Voucher, "id" | "createdAt" | "updatedAt">): Promise<Voucher>;
  getVoucher(code: string): Promise<Voucher | undefined>;
  listVouchers(): Promise<Voucher[]>;
  recordUsage(usage: Omit<VoucherUsage, "id" | "createdAt">): Promise<VoucherUsage>;
  getUsages(voucherId: string): Promise<VoucherUsage[]>;
  getUsageCount(voucherId: string, workspaceId?: string, userId?: string): Promise<number>;
}

export class DefaultVoucherRepository implements VoucherRepository {
  async createVoucher(voucher: Omit<Voucher, "id" | "createdAt" | "updatedAt">): Promise<Voucher> {
    const id = `vou_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(voucherTable).values({
      id,
      code: voucher.code,
      type: voucher.type,
      value: String(voucher.value),
      currency: voucher.currency,
      minPurchase: voucher.minPurchase ? String(voucher.minPurchase) : null,
      maxDiscount: voucher.maxDiscount ? String(voucher.maxDiscount) : null,
      expiresAt: new Date(voucher.expiresAt),
      usageLimit: String(voucher.usageLimit),
      userLimit: String(voucher.userLimit),
      workspaceLimit: String(voucher.workspaceLimit),
      isActive: voucher.isActive,
      metadata: voucher.metadata ?? {},
    });
    return {
      ...voucher,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getVoucher(code: string): Promise<Voucher | undefined> {
    const rows = await db.select().from(voucherTable).where(eq(voucherTable.code, code)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async listVouchers(): Promise<Voucher[]> {
    const rows = await db.select().from(voucherTable);
    return rows.map((row) => this.mapRow(row));
  }

  async recordUsage(usage: Omit<VoucherUsage, "id" | "createdAt">): Promise<VoucherUsage> {
    const id = `vu_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(voucherUsageTable).values({
      id,
      voucherId: usage.voucherId,
      orderId: usage.orderId,
      workspaceId: usage.workspaceId,
      userId: usage.userId,
      discountAmount: String(usage.discountAmount),
      currency: usage.currency,
      metadata: usage.metadata ?? {},
    });
    return {
      ...usage,
      id,
      createdAt: now.toISOString(),
    };
  }

  async getUsages(voucherId: string): Promise<VoucherUsage[]> {
    const rows = await db.select().from(voucherUsageTable).where(eq(voucherUsageTable.voucherId, voucherId));
    return rows.map((row) => ({
      id: row.id,
      voucherId: row.voucherId,
      orderId: row.orderId,
      workspaceId: row.workspaceId,
      userId: row.userId,
      discountAmount: Number(row.discountAmount),
      currency: row.currency,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async getUsageCount(voucherId: string, workspaceId?: string, userId?: string): Promise<number> {
    const conditions = [eq(voucherUsageTable.voucherId, voucherId)];
    if (workspaceId) conditions.push(eq(voucherUsageTable.workspaceId, workspaceId));
    if (userId) conditions.push(eq(voucherUsageTable.userId, userId));

    const result = await db.select({ count: sql<number>`count(*)` }).from(voucherUsageTable).where(and(...conditions));
    return Number(result[0]?.count ?? 0);
  }

  private mapRow(row: typeof voucherTable.$inferSelect): Voucher {
    return {
      id: row.id,
      code: row.code,
      type: row.type as Voucher["type"],
      value: Number(row.value),
      currency: row.currency,
      minPurchase: row.minPurchase ? Number(row.minPurchase) : undefined,
      maxDiscount: row.maxDiscount ? Number(row.maxDiscount) : undefined,
      expiresAt: row.expiresAt.toISOString(),
      usageLimit: Number(row.usageLimit),
      userLimit: Number(row.userLimit),
      workspaceLimit: Number(row.workspaceLimit),
      isActive: row.isActive,
      metadata: row.metadata as Record<string, unknown> | undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
