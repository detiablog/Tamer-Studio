import { db } from "@/lib/db";
import { emailProvider, emailProviderHealth, emailQueue, emailTemplate, emailStatistics, emailLog } from "@/lib/db/schema/email";
import { eq, desc, and, sql, count, sum, gte, lt, inArray } from "drizzle-orm";

export class EmailAdminRepository {
  async findProviders() {
    return db.select({
      id: emailProvider.id,
      name: emailProvider.name,
      type: emailProvider.type,
      description: emailProvider.description,
      isActive: emailProvider.isActive,
      priority: emailProvider.priority,
      routingMode: emailProvider.routingMode,
      senderName: emailProvider.senderName,
      senderEmail: emailProvider.senderEmail,
      replyTo: emailProvider.replyTo,
      dailyLimit: emailProvider.dailyLimit,
      monthlyLimit: emailProvider.monthlyLimit,
      timeout: emailProvider.timeout,
      retryCount: emailProvider.retryCount,
      webhookSecret: sql<string>`null`,
      domain: emailProvider.domain,
      lastTestedAt: emailProvider.lastTestedAt,
      lastTestStatus: emailProvider.lastTestStatus,
      lastTestError: emailProvider.lastTestError,
      createdAt: emailProvider.createdAt,
      updatedAt: emailProvider.updatedAt,
      healthCount: sql<number>`(select count(*) from email_provider_health eph where eph.provider_id = email_provider.id and eph.status != 'disabled')`,
    }).from(emailProvider).orderBy(desc(emailProvider.priority), emailProvider.name);
  }

  async findProviderById(id: string) {
    const [provider] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    return provider;
  }

  async createProvider(data: Record<string, unknown>) {
    const [provider] = await db.insert(emailProvider).values(data as any).returning({
      id: emailProvider.id,
      name: emailProvider.name,
      type: emailProvider.type,
      description: emailProvider.description,
      isActive: emailProvider.isActive,
      priority: emailProvider.priority,
      routingMode: emailProvider.routingMode,
      senderName: emailProvider.senderName,
      senderEmail: emailProvider.senderEmail,
      replyTo: emailProvider.replyTo,
      dailyLimit: emailProvider.dailyLimit,
      monthlyLimit: emailProvider.monthlyLimit,
      timeout: emailProvider.timeout,
      retryCount: emailProvider.retryCount,
      webhookSecret: emailProvider.webhookSecret,
      domain: emailProvider.domain,
      createdAt: emailProvider.createdAt,
      updatedAt: emailProvider.updatedAt,
      lastTestedAt: emailProvider.lastTestedAt,
      lastTestStatus: emailProvider.lastTestStatus,
      lastTestError: emailProvider.lastTestError,
    });
    return provider;
  }

  async updateProvider(id: string, data: Record<string, unknown>) {
    const [updated] = await db.update(emailProvider).set(data).where(eq(emailProvider.id, id)).returning({
      id: emailProvider.id,
      name: emailProvider.name,
      type: emailProvider.type,
      description: emailProvider.description,
      isActive: emailProvider.isActive,
      priority: emailProvider.priority,
      routingMode: emailProvider.routingMode,
      senderName: emailProvider.senderName,
      senderEmail: emailProvider.senderEmail,
      replyTo: emailProvider.replyTo,
      dailyLimit: emailProvider.dailyLimit,
      monthlyLimit: emailProvider.monthlyLimit,
      timeout: emailProvider.timeout,
      retryCount: emailProvider.retryCount,
      webhookSecret: emailProvider.webhookSecret,
      domain: emailProvider.domain,
      createdAt: emailProvider.createdAt,
      updatedAt: emailProvider.updatedAt,
      lastTestedAt: emailProvider.lastTestedAt,
      lastTestStatus: emailProvider.lastTestStatus,
      lastTestError: emailProvider.lastTestError,
    });
    return updated;
  }

  async deleteProvider(id: string) {
    const [deleted] = await db.delete(emailProvider).where(eq(emailProvider.id, id)).returning({ id: emailProvider.id });
    return !!deleted;
  }

  async findProviderHealth(providerId: string) {
    return db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, providerId)).orderBy(desc(emailProviderHealth.checkedAt));
  }

  async findProviderHealthSingle(providerId: string) {
    return db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, providerId)).limit(1);
  }

  async countQueueByProvider(providerId: string) {
    return db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.providerId, providerId)).then((r) => r[0]?.count ?? 0).catch(() => 0) as Promise<number>;
  }

  async updateProviderTestResult(id: string, data: Record<string, unknown>) {
    await db.update(emailProvider).set(data).where(eq(emailProvider.id, id));
  }

  async upsertProviderHealth(providerId: string, data: Record<string, unknown>) {
    await db.update(emailProviderHealth).set(data).where(eq(emailProviderHealth.providerId, providerId));
  }

  async findTemplates(filters?: { type?: string; isActive?: boolean }) {
    let query = db.select().from(emailTemplate);
    const conditions = [];
    if (filters?.type) conditions.push(eq(emailTemplate.type, filters.type));
    if (filters?.isActive !== undefined) conditions.push(eq(emailTemplate.isActive, filters.isActive));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    return query.orderBy(emailTemplate.type, desc(emailTemplate.createdAt));
  }

  async findTemplateById(id: string) {
    const [template] = await db.select().from(emailTemplate).where(eq(emailTemplate.id, id)).limit(1);
    return template;
  }

  async createTemplate(data: Record<string, unknown>) {
    const [template] = await db.insert(emailTemplate).values(data as any).onConflictDoUpdate({
      target: emailTemplate.key,
      set: {
        name: data.name as string,
        type: data.type as string,
        subject: data.subject as string,
        html: data.html as string,
        text: (data.text as string) || null,
        variables: (data.variables as string[]) || [],
        isActive: (data.isActive as boolean) ?? true,
        updatedBy: (data.createdBy as string) || "system",
      },
    }).returning({
      id: emailTemplate.id,
      key: emailTemplate.key,
      name: emailTemplate.name,
      type: emailTemplate.type,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      variables: emailTemplate.variables,
      isActive: emailTemplate.isActive,
      createdBy: emailTemplate.createdBy,
      updatedBy: emailTemplate.updatedBy,
      createdAt: emailTemplate.createdAt,
      updatedAt: emailTemplate.updatedAt,
    });
    return template;
  }

  async updateTemplate(id: string, data: Record<string, unknown>) {
    const [updated] = await db.update(emailTemplate).set(data).where(eq(emailTemplate.id, id)).returning({
      id: emailTemplate.id,
      key: emailTemplate.key,
      name: emailTemplate.name,
      type: emailTemplate.type,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      variables: emailTemplate.variables,
      isActive: emailTemplate.isActive,
      createdBy: emailTemplate.createdBy,
      updatedBy: emailTemplate.updatedBy,
      createdAt: emailTemplate.createdAt,
      updatedAt: emailTemplate.updatedAt,
    });
    return updated;
  }

  async deactivateTemplate(id: string) {
    const [deleted] = await db.update(emailTemplate).set({ isActive: false }).where(eq(emailTemplate.id, id)).returning({ id: emailTemplate.id });
    return !!deleted;
  }

  async findLogs(filters?: { status?: string; type?: string; providerId?: string; to?: string; dateFrom?: Date; dateTo?: Date }) {
    const conditions = [];
    if (filters?.status) conditions.push(eq(emailLog.status, filters.status));
    if (filters?.type) conditions.push(eq(emailLog.type, filters.type));
    if (filters?.providerId) conditions.push(eq(emailLog.providerId, filters.providerId));
    if (filters?.to) conditions.push(eq(emailLog.to, filters.to));
    if (filters?.dateFrom) conditions.push(gte(emailLog.createdAt, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lt(emailLog.createdAt, filters.dateTo));
    return conditions;
  }

  async queryLogs(conditions: any[], limit: number, offset: number) {
    let dataQuery = db.select().from(emailLog);
    if (conditions.length > 0) {
      dataQuery = dataQuery.where(and(...conditions)) as typeof dataQuery;
    }
    return dataQuery.orderBy(desc(emailLog.createdAt)).limit(limit).offset(offset);
  }

  async countLogs(conditions: any[]) {
    return db.select({ count: sql<number>`count(*)` }).from(emailLog).where(and(...conditions));
  }

  async findProvidersByIds(ids: string[]) {
    return db.select({ id: emailProvider.id, name: emailProvider.name }).from(emailProvider).where(inArray(emailProvider.id, ids));
  }

  async findQueueItems(filters?: { status?: string; type?: string; providerId?: string; dateFrom?: Date; dateTo?: Date }) {
    const conditions = [];
    if (filters?.status) conditions.push(eq(emailQueue.status, filters.status));
    if (filters?.type) conditions.push(eq(emailQueue.type, filters.type));
    if (filters?.providerId) conditions.push(eq(emailQueue.providerId, filters.providerId));
    if (filters?.dateFrom) conditions.push(gte(emailQueue.createdAt, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lt(emailQueue.createdAt, filters.dateTo));
    return conditions;
  }

  async queryQueue(conditions: any[], limit: number, offset: number) {
    let dataQuery = db.select().from(emailQueue);
    if (conditions.length > 0) {
      dataQuery = dataQuery.where(and(...conditions)) as typeof dataQuery;
    }
    return dataQuery.orderBy(desc(emailQueue.createdAt)).limit(limit).offset(offset);
  }

  async countQueue(conditions: any[]) {
    return db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(and(...conditions));
  }

  async retryQueueItems(ids: string[]) {
    return db.update(emailQueue).set({
      status: "queued",
      attempts: 0,
      failedAt: null,
      error: null,
      updatedAt: new Date(),
    }).where(and(eq(emailQueue.status, "failed"), ...ids.map((id) => eq(emailQueue.id, id)))).returning({
      id: emailQueue.id,
      status: emailQueue.status,
      type: emailQueue.type,
      to: emailQueue.to,
      subject: emailQueue.subject,
      attempts: emailQueue.attempts,
      createdAt: emailQueue.createdAt,
      updatedAt: emailQueue.updatedAt,
    });
  }

  async findStatistics(conditions: any[]) {
    return db.select().from(emailStatistics).where(and(...conditions)).orderBy(desc(emailStatistics.date));
  }

  async findHealthData(providerId?: string) {
    if (providerId) {
      return db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, providerId)).orderBy(desc(emailProviderHealth.checkedAt));
    }
    return db.select().from(emailProviderHealth).orderBy(desc(emailProviderHealth.checkedAt));
  }

  async getOverviewCounts() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return Promise.all([
      db.select({ value: count() }).from(emailProvider),
      db.select({ value: count() }).from(emailProvider).where(eq(emailProvider.isActive, true)),
      db.select({ value: count() }).from(emailProviderHealth).where(eq(emailProviderHealth.status, "healthy")),
      db.select({ value: count() }).from(emailProviderHealth).where(eq(emailProviderHealth.status, "warning")),
      db.select({ value: count() }).from(emailProviderHealth).where(eq(emailProviderHealth.status, "offline")),
      db.select({ value: count() }).from(emailQueue),
      db.select({ value: count() }).from(emailQueue).where(eq(emailQueue.status, "queued")),
      db.select({ value: count() }).from(emailQueue).where(eq(emailQueue.status, "processing")),
      db.select({ value: count() }).from(emailQueue).where(eq(emailQueue.status, "failed")),
      db.select({ value: count() }).from(emailTemplate),
      db.select({ value: count() }).from(emailTemplate).where(eq(emailTemplate.isActive, true)),
      db.select({ value: count() }).from(emailLog),
      db.select({
        sent: sql<number>`coalesce(${sum(emailStatistics.sent)}, 0)`,
        delivered: sql<number>`coalesce(${sum(emailStatistics.delivered)}, 0)`,
        failed: sql<number>`coalesce(${sum(emailStatistics.failed)}, 0)`,
        retry: sql<number>`coalesce(${sum(emailStatistics.retry)}, 0)`,
        bounce: sql<number>`coalesce(${sum(emailStatistics.bounce)}, 0)`,
      }).from(emailStatistics).where(gte(emailStatistics.date, todayStart)),
    ]);
  }
}

export const emailAdminRepository = new EmailAdminRepository();
