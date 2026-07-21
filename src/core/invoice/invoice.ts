import type { Invoice, InvoiceLineItem } from "@/lib/ai/types/billing";
import { db } from "@/lib/db";
import { invoice as invoiceTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface InvoiceRepository {
  createInvoice(workspaceId: string, lineItems: InvoiceLineItem[]): Promise<Invoice>;
  getInvoice(invoiceId: string): Promise<Invoice | undefined>;
  listInvoices(workspaceId: string): Promise<Invoice[]>;
  updateInvoiceStatus(invoiceId: string, status: Invoice["status"]): Promise<void>;
}

export class DefaultInvoiceRepository implements InvoiceRepository {
  async createInvoice(workspaceId: string, lineItems: InvoiceLineItem[]): Promise<Invoice> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    await db.insert(invoiceTable).values({
      id,
      workspaceId,
      status: "draft",
      currency: "USD",
      subtotal: String(subtotal),
      tax: String(tax),
      total: String(total),
      lineItems: lineItems as unknown as Record<string, unknown>[],
      metadata: {},
    });

    return {
      id,
      workspaceId,
      status: "draft" as Invoice["status"],
      currency: "USD",
      subtotal,
      tax,
      total,
      lineItems,
      metadata: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async getInvoice(invoiceId: string): Promise<Invoice | undefined> {
    const rows = await db.select().from(invoiceTable).where(eq(invoiceTable.id, invoiceId)).limit(1);
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      subscriptionId: row.subscriptionId ?? undefined,
      status: row.status as Invoice["status"],
      currency: row.currency,
      subtotal: Number(row.subtotal),
      tax: Number(row.tax),
      total: Number(row.total),
      lineItems: row.lineItems as unknown as InvoiceLineItem[],
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listInvoices(workspaceId: string): Promise<Invoice[]> {
    const rows = await db.select().from(invoiceTable).where(eq(invoiceTable.workspaceId, workspaceId));
    return rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspaceId,
      subscriptionId: row.subscriptionId ?? undefined,
      status: row.status as Invoice["status"],
      currency: row.currency,
      subtotal: Number(row.subtotal),
      tax: Number(row.tax),
      total: Number(row.total),
      lineItems: row.lineItems as unknown as InvoiceLineItem[],
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice["status"]): Promise<void> {
    const now = new Date();
    await db.update(invoiceTable).set({ status, updatedAt: now }).where(eq(invoiceTable.id, invoiceId));
  }
}
