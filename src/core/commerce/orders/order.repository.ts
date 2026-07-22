import { db } from "@/lib/db";
import { order as orderTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Order, OrderItem } from "../types";

export interface OrderRepository {
  createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt"> & { items: OrderItem[] }): Promise<Order>;
  getOrder(orderId: string): Promise<Order | undefined>;
  getOrdersByWorkspace(workspaceId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: Order["status"], extra?: Partial<Order>): Promise<Order>;
  cancelOrder(orderId: string): Promise<Order>;
  updateOrderTotals(orderId: string, subtotal: number, tax: number, discount: number, total: number): Promise<Order>;
}

export class DefaultOrderRepository implements OrderRepository {
  async createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt"> & { items: OrderItem[] }): Promise<Order> {
    const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    await db.insert(orderTable).values({
      id,
      workspaceId: order.workspaceId,
      userId: order.userId,
      status: order.status,
      currency: order.currency,
      subtotal: String(order.subtotal),
      tax: String(order.tax),
      discount: String(order.discount),
      total: String(order.total),
      items: order.items as unknown as Record<string, unknown>[],
      metadata: order.metadata ?? {},
      expiresAt: order.expiresAt ? new Date(order.expiresAt) : null,
      paidAt: order.paidAt ? new Date(order.paidAt) : null,
      cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : null,
      refundedAt: order.refundedAt ? new Date(order.refundedAt) : null,
    });
    return {
      ...order,
      id,
      items: order.items,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    const rows = await db.select().from(orderTable).where(eq(orderTable.id, orderId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async getOrdersByWorkspace(workspaceId: string): Promise<Order[]> {
    const rows = await db.select().from(orderTable).where(eq(orderTable.workspaceId, workspaceId));
    return rows.map((row) => this.mapRow(row));
  }

  async updateOrderStatus(orderId: string, status: Order["status"], extra?: Partial<Order>): Promise<Order> {
    const now = new Date();
    const updateData: Record<string, unknown> = { status, updatedAt: now };
    if (extra) {
      if (extra.paidAt) updateData.paidAt = new Date(extra.paidAt);
      if (extra.cancelledAt) updateData.cancelledAt = new Date(extra.cancelledAt);
      if (extra.refundedAt) updateData.refundedAt = new Date(extra.refundedAt);
      if (extra.metadata !== undefined) updateData.metadata = extra.metadata;
    }
    await db.update(orderTable).set(updateData).where(eq(orderTable.id, orderId));
    const rows = await db.select().from(orderTable).where(eq(orderTable.id, orderId)).limit(1);
    if (rows.length === 0) throw new Error(`Order ${orderId} not found after update`);
    return this.mapRow(rows[0]);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.updateOrderStatus(orderId, "cancelled", { cancelledAt: new Date().toISOString() });
  }

  async updateOrderTotals(orderId: string, subtotal: number, tax: number, discount: number, total: number): Promise<Order> {
    const now = new Date();
    await db.update(orderTable).set({
      subtotal: String(subtotal),
      tax: String(tax),
      discount: String(discount),
      total: String(total),
      updatedAt: now,
    }).where(eq(orderTable.id, orderId));
    const rows = await db.select().from(orderTable).where(eq(orderTable.id, orderId)).limit(1);
    if (rows.length === 0) throw new Error(`Order ${orderId} not found after update`);
    return this.mapRow(rows[0]);
  }

  private mapRow(row: typeof orderTable.$inferSelect): Order {
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      userId: row.userId,
      status: row.status as Order["status"],
      currency: row.currency,
      subtotal: Number(row.subtotal),
      tax: Number(row.tax),
      discount: Number(row.discount),
      total: Number(row.total),
      items: row.items as unknown as OrderItem[],
      metadata: row.metadata as Record<string, unknown> | undefined,
      expiresAt: row.expiresAt?.toISOString(),
      paidAt: row.paidAt?.toISOString(),
      cancelledAt: row.cancelledAt?.toISOString(),
      refundedAt: row.refundedAt?.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
