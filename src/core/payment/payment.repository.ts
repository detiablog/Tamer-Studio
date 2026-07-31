import { db } from "@/lib/db";
import { payment, paymentItem, paymentInvoice, paymentRefund, paymentWebhook, paymentLog } from "@/lib/db/schema/payments";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PaymentRepository {
  async findPayments(filters?: { userId?: string; status?: string; providerId?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(payment.userId, filters.userId));
    if (filters?.status) conditions.push(eq(payment.status, filters.status));
    if (filters?.providerId) conditions.push(eq(payment.providerId, filters.providerId));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(payment).where(where).orderBy(desc(payment.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(payment).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async findPaymentById(id: string) {
    const [item] = await db.select().from(payment).where(eq(payment.id, id)).limit(1);
    return item;
  }

  async findPaymentByNumber(transactionNumber: string) {
    const [item] = await db.select().from(payment).where(eq(payment.transactionNumber, transactionNumber)).limit(1);
    return item;
  }

  async createPayment(data: typeof payment.$inferInsert) {
    const [item] = await db.insert(payment).values(data).returning();
    return item;
  }

  async updatePaymentStatus(id: string, status: string, extra?: Record<string, unknown>) {
    const set: Record<string, unknown> = { status, updatedAt: new Date() };
    if (extra) Object.assign(set, extra);
    const [item] = await db.update(payment).set(set).where(eq(payment.id, id)).returning();
    return item;
  }

  async findPaymentItems(paymentId: string) {
    return db.select().from(paymentItem).where(eq(paymentItem.paymentId, paymentId)).orderBy(desc(paymentItem.createdAt));
  }

  async createPaymentItem(data: typeof paymentItem.$inferInsert) {
    const [item] = await db.insert(paymentItem).values(data).returning();
    return item;
  }

  async findInvoices(filters?: { userId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.userId) conditions.push(eq(paymentInvoice.userId, filters.userId));
    if (filters?.status) conditions.push(eq(paymentInvoice.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(paymentInvoice).where(where).orderBy(desc(paymentInvoice.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(paymentInvoice).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async findInvoiceById(id: string) {
    const [item] = await db.select().from(paymentInvoice).where(eq(paymentInvoice.id, id)).limit(1);
    return item;
  }

  async findInvoiceByNumber(invoiceNumber: string) {
    const [item] = await db.select().from(paymentInvoice).where(eq(paymentInvoice.invoiceNumber, invoiceNumber)).limit(1);
    return item;
  }

  async createInvoice(data: typeof paymentInvoice.$inferInsert) {
    const [item] = await db.insert(paymentInvoice).values(data).returning();
    return item;
  }

  async updateInvoiceStatus(id: string, status: string, extra?: Record<string, unknown>) {
    const set: Record<string, unknown> = { status, updatedAt: new Date() };
    if (extra) Object.assign(set, extra);
    const [item] = await db.update(paymentInvoice).set(set).where(eq(paymentInvoice.id, id)).returning();
    return item;
  }

  async findRefunds(filters?: { paymentId?: string; userId?: string; status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.paymentId) conditions.push(eq(paymentRefund.paymentId, filters.paymentId));
    if (filters?.userId) conditions.push(eq(paymentRefund.userId, filters.userId));
    if (filters?.status) conditions.push(eq(paymentRefund.status, filters.status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(paymentRefund).where(where).orderBy(desc(paymentRefund.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(paymentRefund).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async createRefund(data: typeof paymentRefund.$inferInsert) {
    const [item] = await db.insert(paymentRefund).values(data).returning();
    return item;
  }

  async updateRefundStatus(id: string, status: string, extra?: Record<string, unknown>) {
    const set: Record<string, unknown> = { status, updatedAt: new Date() };
    if (extra) Object.assign(set, extra);
    const [item] = await db.update(paymentRefund).set(set).where(eq(paymentRefund.id, id)).returning();
    return item;
  }

  async findWebhooks(filters?: { provider?: string; paymentId?: string; processed?: boolean; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];
    if (filters?.provider) conditions.push(eq(paymentWebhook.provider, filters.provider));
    if (filters?.paymentId) conditions.push(eq(paymentWebhook.paymentId, filters.paymentId));
    if (filters?.processed !== undefined) conditions.push(eq(paymentWebhook.processed, filters.processed));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const [data, totalResult] = await Promise.all([
      db.select().from(paymentWebhook).where(where).orderBy(desc(paymentWebhook.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(paymentWebhook).where(where),
    ]);
    return { data, total: Number(totalResult[0]?.count ?? 0), page, limit, totalPages: Math.ceil(Number(totalResult[0]?.count ?? 0) / limit) };
  }

  async createWebhook(data: typeof paymentWebhook.$inferInsert) {
    const [item] = await db.insert(paymentWebhook).values(data).returning();
    return item;
  }

  async updateWebhookStatus(id: string, processed: boolean, error?: string) {
    const set: Record<string, unknown> = { processed };
    if (processed) set.processedAt = new Date();
    if (error !== undefined) set.error = error;
    const [item] = await db.update(paymentWebhook).set(set).where(eq(paymentWebhook.id, id)).returning();
    return item;
  }

  async createPaymentLog(data: typeof paymentLog.$inferInsert) {
    const [item] = await db.insert(paymentLog).values(data).returning();
    return item;
  }

  async getDashboardStats() {
    const [totalPayments] = await db.select({ count: sql<number>`count(*)` }).from(payment);
    const [pendingPayments] = await db.select({ count: sql<number>`count(*)` }).from(payment).where(eq(payment.status, "pending"));
    const [processingPayments] = await db.select({ count: sql<number>`count(*)` }).from(payment).where(eq(payment.status, "processing"));
    const [completedPayments] = await db.select({ count: sql<number>`count(*)` }).from(payment).where(eq(payment.status, "paid"));
    const [failedPayments] = await db.select({ count: sql<number>`count(*)` }).from(payment).where(eq(payment.status, "failed"));
    const [totalRevenue] = await db.select({ total: sql<number>`coalesce(sum(cast(${payment.finalAmount} as numeric)), 0)` }).from(payment).where(eq(payment.status, "paid"));
    const [totalRefunds] = await db.select({ count: sql<number>`count(*)` }).from(paymentRefund).where(eq(paymentRefund.status, "completed"));
    const [totalRefundAmount] = await db.select({ total: sql<number>`coalesce(sum(cast(${paymentRefund.amount} as numeric)), 0)` }).from(paymentRefund).where(eq(paymentRefund.status, "completed"));
    const [totalInvoices] = await db.select({ count: sql<number>`count(*)` }).from(paymentInvoice);
    return {
      totalPayments: Number(totalPayments?.count ?? 0),
      pendingPayments: Number(pendingPayments?.count ?? 0),
      processingPayments: Number(processingPayments?.count ?? 0),
      completedPayments: Number(completedPayments?.count ?? 0),
      failedPayments: Number(failedPayments?.count ?? 0),
      totalRevenue: Number(totalRevenue?.total ?? 0),
      totalRefunds: Number(totalRefunds?.count ?? 0),
      totalRefundAmount: Number(totalRefundAmount?.total ?? 0),
      totalInvoices: Number(totalInvoices?.count ?? 0),
    };
  }

  async getAnalytics(dateRange?: { from?: Date; to?: Date }) {
    const conditions = [];
    if (dateRange?.from) conditions.push(sql`${payment.createdAt} >= ${dateRange.from}`);
    if (dateRange?.to) conditions.push(sql`${payment.createdAt} <= ${dateRange.to}`);
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [revenueResult] = await db.select({
      total: sql<number>`coalesce(sum(cast(${payment.finalAmount} as numeric)), 0)`,
      count: sql<number>`count(*)`,
    }).from(payment).where(and(where, eq(payment.status, "paid")));

    const [avgAmount] = await db.select({
      avg: sql<number>`coalesce(avg(cast(${payment.finalAmount} as numeric)), 0)`,
    }).from(payment).where(and(where, eq(payment.status, "paid")));

    const statusBreakdown = await db.select({
      status: payment.status,
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(cast(${payment.finalAmount} as numeric)), 0)`,
    }).from(payment).where(where).groupBy(payment.status);

    const providerBreakdown = await db.select({
      providerId: payment.providerId,
      count: sql<number>`count(*)`,
      total: sql<number>`coalesce(sum(cast(${payment.finalAmount} as numeric)), 0)`,
    }).from(payment).where(and(where, eq(payment.status, "paid"))).groupBy(payment.providerId);

    return {
      totalRevenue: Number(revenueResult?.total ?? 0),
      totalTransactions: Number(revenueResult?.count ?? 0),
      averageAmount: Number(avgAmount?.avg ?? 0),
      statusBreakdown,
      providerBreakdown,
    };
  }
}

export const paymentRepository = new PaymentRepository();
