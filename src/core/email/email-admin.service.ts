import { db } from "@/lib/db";
import { emailProvider, emailProviderHealth, emailQueue, emailTemplate, emailStatistics, emailLog } from "@/lib/db/schema/email";
import { eq, desc, and, sql, count, sum, gte, lt, inArray } from "drizzle-orm";
import { encrypt, decrypt, maskSensitive, generateId } from "@/modules/email";
import type { ProviderType } from "@/modules/email";

export interface EmailProviderInput {
  type: ProviderType;
  name: string;
  description?: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  timeout?: number;
  retryCount?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  webhookSecret?: string;
  domain?: string;
  credentials?: Record<string, unknown>;
  isActive?: boolean;
  priority?: number;
  routingMode?: string;
}

export class EmailAdminService {
  async getProviders() {
    const providers = await db.select({
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

    return providers.map((p) => ({
      ...p,
      webhookSecret: p.webhookSecret ? `${p.webhookSecret.slice(0, 4)}****` : null,
    }));
  }

  async getProvider(id: string) {
    const [provider] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    if (!provider) return undefined;

    const [health, queueCount] = await Promise.all([
      db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, id)).limit(1),
      db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(eq(emailQueue.providerId, id)).then((r) => r[0]?.count ?? 0).catch(() => 0) as Promise<number>,
    ]);

    let credentials: Record<string, unknown> | null = null;
    if (provider.credentialsEncrypted) {
      try {
        const decrypted = decrypt(provider.credentialsEncrypted);
        credentials = JSON.parse(decrypted);
      } catch {
        credentials = { error: "Failed to decrypt credentials" };
      }
    }

    return {
      ...provider,
      credentials,
      health: health[0] || null,
      queueCount: typeof queueCount === "number" ? queueCount : Number(queueCount) || 0,
    };
  }

  async createProvider(input: EmailProviderInput) {
    const id = generateId("provider");
    const encryptedCredentials = input.credentials ? encrypt(JSON.stringify(input.credentials)) : null;

    const [provider] = await db.insert(emailProvider).values({
      id,
      type: input.type,
      name: input.name,
      description: input.description || null,
      senderName: input.senderName,
      senderEmail: input.senderEmail,
      replyTo: input.replyTo || null,
      timeout: input.timeout ?? 30,
      retryCount: input.retryCount ?? 3,
      dailyLimit: input.dailyLimit ?? 0,
      monthlyLimit: input.monthlyLimit ?? 0,
      webhookSecret: input.webhookSecret || null,
      domain: input.domain || null,
      credentialsEncrypted: encryptedCredentials,
      isActive: input.isActive ?? false,
      priority: input.priority ?? 0,
      routingMode: input.routingMode || "priority",
      config: {},
    }).returning({
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

  async updateProvider(id: string, input: Partial<EmailProviderInput>) {
    const [existing] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    if (!existing) return undefined;

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.senderName !== undefined) updateData.senderName = input.senderName;
    if (input.senderEmail !== undefined) updateData.senderEmail = input.senderEmail;
    if (input.replyTo !== undefined) updateData.replyTo = input.replyTo;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.routingMode !== undefined) updateData.routingMode = input.routingMode;
    if (input.timeout !== undefined) updateData.timeout = input.timeout;
    if (input.retryCount !== undefined) updateData.retryCount = input.retryCount;
    if (input.dailyLimit !== undefined) updateData.dailyLimit = input.dailyLimit;
    if (input.monthlyLimit !== undefined) updateData.monthlyLimit = input.monthlyLimit;
    if (input.webhookSecret !== undefined) updateData.webhookSecret = input.webhookSecret;
    if (input.domain !== undefined) updateData.domain = input.domain;
    if (input.config !== undefined) updateData.config = input.config;

    if (input.credentials) {
      updateData.credentialsEncrypted = encrypt(JSON.stringify(input.credentials));
    }

    if (Object.keys(updateData).length === 0) return existing;

    const [updated] = await db.update(emailProvider).set(updateData).where(eq(emailProvider.id, id)).returning({
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

  async getTemplates(filters?: { type?: string; isActive?: boolean }) {
    let query = db.select().from(emailTemplate);
    const conditions = [];

    if (filters?.type) conditions.push(eq(emailTemplate.type, filters.type));
    if (filters?.isActive !== undefined) conditions.push(eq(emailTemplate.isActive, filters.isActive));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const templates = await query.orderBy(emailTemplate.type, desc(emailTemplate.createdAt));
    return templates.map((t) => ({
      id: t.id,
      key: t.key,
      name: t.name,
      type: t.type,
      subject: t.subject,
      html: t.html,
      text: t.text,
      variables: t.variables,
      isActive: t.isActive,
      createdBy: t.createdBy,
      updatedBy: t.updatedBy,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async getTemplate(id: string) {
    const [template] = await db.select().from(emailTemplate).where(eq(emailTemplate.id, id)).limit(1);
    if (!template) return undefined;
    return {
      id: template.id,
      key: template.key,
      name: template.name,
      type: template.type,
      subject: template.subject,
      html: template.html,
      text: template.text,
      variables: template.variables,
      isActive: template.isActive,
      createdBy: template.createdBy,
      updatedBy: template.updatedBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async createTemplate(data: {
    key: string;
    name: string;
    type: string;
    subject: string;
    html: string;
    text?: string;
    variables?: string[];
    isActive?: boolean;
    createdBy?: string;
  }) {
    const id = generateId("tmpl");
    const [template] = await db.insert(emailTemplate).values({
      id,
      key: data.key,
      name: data.name,
      type: data.type,
      subject: data.subject,
      html: data.html,
      text: data.text || null,
      variables: data.variables || [],
      isActive: data.isActive ?? true,
      createdBy: data.createdBy || "system",
      updatedBy: data.createdBy || "system",
    }).onConflictDoUpdate({
      target: emailTemplate.key,
      set: {
        name: data.name,
        type: data.type,
        subject: data.subject,
        html: data.html,
        text: data.text || null,
        variables: data.variables || [],
        isActive: data.isActive ?? true,
        updatedBy: data.createdBy || "system",
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

  async updateTemplate(id: string, data: Partial<{
    key: string;
    name: string;
    type: string;
    subject: string;
    html: string;
    text: string;
    variables: string[];
    isActive: boolean;
  }>) {
    const [existing] = await db.select().from(emailTemplate).where(eq(emailTemplate.id, id)).limit(1);
    if (!existing) return undefined;

    const updateData: Record<string, unknown> = {};
    if (data.key !== undefined) updateData.key = data.key;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.html !== undefined) updateData.html = data.html;
    if (data.text !== undefined) updateData.text = data.text;
    if (data.variables !== undefined) updateData.variables = data.variables;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length === 0) return existing;

    const [updated] = await db.update(emailTemplate).set(updateData).where(eq(emailTemplate.id, id)).returning({
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

  async deleteTemplate(id: string) {
    const [deleted] = await db.update(emailTemplate).set({ isActive: false }).where(eq(emailTemplate.id, id)).returning({ id: emailTemplate.id });
    return !!deleted;
  }

  async getLogs(filters?: { page?: number; limit?: number; status?: string; type?: string; providerId?: string; to?: string; dateFrom?: Date; dateTo?: Date; search?: string }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];

    if (filters?.status) conditions.push(eq(emailLog.status, filters.status));
    if (filters?.type) conditions.push(eq(emailLog.type, filters.type));
    if (filters?.providerId) conditions.push(eq(emailLog.providerId, filters.providerId));
    if (filters?.to) conditions.push(eq(emailLog.to, filters.to));
    if (filters?.dateFrom) conditions.push(gte(emailLog.createdAt, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lt(emailLog.createdAt, filters.dateTo));

    let dataQuery = db.select().from(emailLog);
    if (conditions.length > 0) {
      dataQuery = dataQuery.where(and(...conditions)) as typeof dataQuery;
    }

    const [data, countRow] = await Promise.all([
      dataQuery.orderBy(desc(emailLog.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(emailLog).where(and(...conditions)),
    ]);

    const providerIds = Array.from(new Set(data.map((l) => l.providerId).filter(Boolean)));
    let providerMap: Record<string, string> = {};
    if (providerIds.length > 0) {
      const providers = await db.select({ id: emailProvider.id, name: emailProvider.name }).from(emailProvider).where(inArray(emailProvider.id, providerIds as string[]));
      providerMap = providers.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<string, string>);
    }

    const logs = data.map((log) => ({
      ...log,
      providerName: log.providerId ? (providerMap[log.providerId] || log.providerName || null) : log.providerName || null,
    }));

    return {
      data: logs,
      page,
      limit,
      total: Number(countRow[0]?.count ?? 0),
      totalPages: Math.ceil(Number(countRow[0]?.count ?? 0) / limit),
    };
  }

  async getQueue(filters?: { page?: number; limit?: number; status?: string; type?: string; providerId?: string; dateFrom?: Date; dateTo?: Date; search?: string }) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const offset = (page - 1) * limit;
    const conditions = [];

    if (filters?.status) conditions.push(eq(emailQueue.status, filters.status));
    if (filters?.type) conditions.push(eq(emailQueue.type, filters.type));
    if (filters?.providerId) conditions.push(eq(emailQueue.providerId, filters.providerId));
    if (filters?.dateFrom) conditions.push(gte(emailQueue.createdAt, filters.dateFrom));
    if (filters?.dateTo) conditions.push(lt(emailQueue.createdAt, filters.dateTo));

    let dataQuery = db.select().from(emailQueue);
    if (conditions.length > 0) {
      dataQuery = dataQuery.where(and(...conditions)) as typeof dataQuery;
    }

    const [data, countRow] = await Promise.all([
      dataQuery.orderBy(desc(emailQueue.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(emailQueue).where(and(...conditions)),
    ]);

    const items = data.filter((item) => {
      if (!filters?.search) return true;
      return item.to.toLowerCase().includes(filters.search!.toLowerCase()) ||
        item.subject.toLowerCase().includes(filters.search!.toLowerCase());
    });

    return {
      data: items,
      page,
      limit,
      total: Number(countRow[0]?.count ?? 0),
      totalPages: Math.ceil(Number(countRow[0]?.count ?? 0) / limit),
    };
  }

  async retryQueue(ids: string[]) {
    const [updated] = await db.update(emailQueue).set({
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

    return updated;
  }

  async getStatistics(filters?: { providerId?: string; dateFrom?: Date; dateTo?: string; groupBy?: string }) {
    const now = new Date();
    const toDate = filters?.dateTo ? new Date(filters.dateTo) : now;
    const fromDate = filters?.dateFrom || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const conditions = [];
    if (filters?.providerId) conditions.push(eq(emailStatistics.providerId, filters.providerId));
    conditions.push(gte(emailStatistics.date, fromDate));
    conditions.push(lt(emailStatistics.date, toDate));

    const stats = await db.select().from(emailStatistics).where(and(...conditions)).orderBy(desc(emailStatistics.date));

    const providerIds = Array.from(new Set(stats.map((s) => s.providerId).filter(Boolean)));
    let providerMap: Record<string, string> = {};
    if (providerIds.length > 0) {
      const providers = await db.select({ id: emailProvider.id, name: emailProvider.name }).from(emailProvider).where(inArray(emailProvider.id, providerIds as string[]));
      providerMap = providers.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<string, string>);
    }

    const formatted = stats.map((s) => ({
      id: s.id,
      providerId: s.providerId,
      providerName: s.providerId ? (providerMap[s.providerId] || null) : null,
      date: s.date,
      sent: s.sent,
      delivered: s.delivered,
      failed: s.failed,
      retry: s.retry,
      bounce: s.bounce,
      avgLatencyMs: s.avgLatencyMs,
      quotaUsed: s.quotaUsed,
      quotaTotal: s.quotaTotal,
    }));

    const totals = formatted.reduce(
      (acc, s) => {
        acc.sent += s.sent;
        acc.delivered += s.delivered;
        acc.failed += s.failed;
        acc.retry += s.retry;
        acc.bounce += s.bounce;
        acc.quotaUsed += s.quotaUsed;
        return acc;
      },
      { sent: 0, delivered: 0, failed: 0, retry: 0, bounce: 0, quotaUsed: 0 }
    );

    return {
      data: formatted,
      totals,
      dateRange: { from: fromDate, to: toDate },
      groupBy: filters?.groupBy || "day",
      count: formatted.length,
    };
  }

  async getHealth(filters?: { providerId?: string }) {
    let rows;
    if (filters?.providerId) {
      [rows] = await Promise.all([
        db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, filters.providerId)).orderBy(desc(emailProviderHealth.checkedAt)),
      ]);
    } else {
      rows = await db.select().from(emailProviderHealth).orderBy(desc(emailProviderHealth.checkedAt));
    }

    const providerIds = Array.from(new Set(rows.map((r) => r.providerId)));
    let providerMap: Record<string, string> = {};
    if (providerIds.length > 0) {
      const providers = await db.select({ id: emailProvider.id, name: emailProvider.name }).from(emailProvider).where(and(...providerIds.map((pid) => eq(emailProvider.id, pid))));
      providerMap = providers.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {} as Record<string, string>);
    }

    const healthData = rows.map((r) => ({
      id: r.id,
      providerId: r.providerId,
      providerName: providerMap[r.providerId] || null,
      status: r.status,
      latencyMs: r.latencyMs,
      lastSuccessAt: r.lastSuccessAt,
      lastFailureAt: r.lastFailureAt,
      consecutiveFailures: r.consecutiveFailures,
      errorMessage: r.errorMessage,
      errorCode: r.errorCode,
      checkedAt: r.checkedAt,
    }));

    return {
      data: healthData,
      count: healthData.length,
    };
  }

  async getOverview() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalProvidersResult,
      activeProvidersResult,
      healthyProvidersResult,
      warningProvidersResult,
      offlineProvidersResult,
      totalQueueResult,
      queuedQueueResult,
      processingQueueResult,
      failedQueueResult,
      totalTemplatesResult,
      activeTemplatesResult,
      totalLogsResult,
      todayStatsResult,
    ] = await Promise.all([
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

    return {
      providers: {
        total: totalProvidersResult[0]?.value ?? 0,
        active: activeProvidersResult[0]?.value ?? 0,
      },
      health: {
        total: totalProvidersResult[0]?.value ?? 0,
        healthy: healthyProvidersResult[0]?.value ?? 0,
        warning: warningProvidersResult[0]?.value ?? 0,
        offline: offlineProvidersResult[0]?.value ?? 0,
      },
      queue: {
        total: totalQueueResult[0]?.value ?? 0,
        queued: queuedQueueResult[0]?.value ?? 0,
        processing: processingQueueResult[0]?.value ?? 0,
        failed: failedQueueResult[0]?.value ?? 0,
      },
      templates: {
        total: totalTemplatesResult[0]?.value ?? 0,
        active: activeTemplatesResult[0]?.value ?? 0,
      },
      logs: {
        total: totalLogsResult[0]?.value ?? 0,
      },
      today: {
        sent: Number(todayStatsResult[0]?.sent ?? 0),
        delivered: Number(todayStatsResult[0]?.delivered ?? 0),
        failed: Number(todayStatsResult[0]?.failed ?? 0),
        retry: Number(todayStatsResult[0]?.retry ?? 0),
        bounce: Number(todayStatsResult[0]?.bounce ?? 0),
      },
    };
  }

  async validateProvider(id: string) {
    const [provider] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    if (!provider) {
      return { valid: false, errors: ["Provider not found"], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!provider.name || provider.name.trim().length === 0) errors.push("Provider name is required");
    if (!provider.senderName || provider.senderName.trim().length === 0) errors.push("Sender name is required");
    if (!provider.senderEmail || provider.senderEmail.trim().length === 0) errors.push("Sender email is required");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (provider.senderEmail && !emailRegex.test(provider.senderEmail)) errors.push("Invalid sender email format");

    const config = (provider.config as Record<string, unknown>) || {};
    const validateConfig = (key: string) => typeof config[key] === "string" && config[key].length > 0;

    if (provider.type === "smtp") {
      if (!validateConfig("host") && !validateConfig("hostname")) errors.push("SMTP host is required");
      if (!validateConfig("port") && !(config.secure as boolean)) errors.push("SMTP port is required");
      const auth = config.auth as Record<string, unknown> | undefined;
      if (!auth || (!validateConfig("user") && !validateConfig("username"))) errors.push("SMTP username is required");
      if (!auth || !validateConfig("pass")) errors.push("SMTP password is required");
    } else if (provider.type === "sendgrid") {
      if (!validateConfig("apiKey")) errors.push("SendGrid API key is required");
      if (validateConfig("apiKey") && !(config.apiKey as string).startsWith("SG.")) warnings.push("SendGrid API keys typically start with 'SG.'");
    } else if (provider.type === "resend") {
      if (!validateConfig("apiKey")) errors.push("Resend API key is required");
    } else if (provider.type === "amazon") {
      if (!validateConfig("accessKeyId")) errors.push("AWS Access Key ID is required");
      if (!validateConfig("secretAccessKey")) errors.push("AWS Secret Access Key is required");
      if (!validateConfig("region")) warnings.push("AWS region not specified, defaulting to us-east-1");
    } else if (provider.type === "mailgun") {
      if (!validateConfig("apiKey")) errors.push("Mailgun API key is required");
      if (!validateConfig("domain")) warnings.push("Mailgun domain not specified");
    } else if (provider.type === "postmark") {
      if (!validateConfig("apiKey")) errors.push("Postmark API key is required");
      if (!validateConfig("serverToken")) warnings.push("Postmark server token not specified");
    } else if (provider.type === "brevo") {
      if (!validateConfig("apiKey")) errors.push("Brevo API key is required");
    } else if (provider.type === "sparkpost") {
      if (!config.apiKey) errors.push("SparkPost API key is required");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      providerId: id,
      providerName: provider.name,
      providerType: provider.type,
    };
  }

  async testProvider(id: string) {
    const [provider] = await db.select().from(emailProvider).where(eq(emailProvider.id, id)).limit(1);
    if (!provider) {
      return { success: false, error: "Provider not found" };
    }

    const start = Date.now();
    let success = false;
    let error: string | undefined;
    let response: Record<string, unknown> | undefined;

    try {
      if (provider.type === "smtp") {
        const { createTransport } = await import("nodemailer");
        const transport = createTransport({
          host: provider.domain || "smtp.example.com",
          port: provider.config?.port as number || 587,
          secure: (provider.config?.secure as boolean) || false,
          auth: provider.config?.auth as Record<string, string>,
        });
        await new Promise((resolve, reject) => {
          transport.verify((err: unknown) => {
            if (err) reject(err);
            else resolve(true);
          });
        });
        success = true;
        response = { verified: true, provider: provider.type };
      } else if (provider.type === "sendgrid") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.sendgrid.com/v3/user/profile", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.errors?.map((e: { message?: string }) => e.message || "Unknown error").join(", ") || `HTTP ${res.status}`);
        }
      } else if (provider.type === "resend") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: provider.senderEmail, to: "test@example.com", subject: "test", text: "test" }),
        });
        if (res.status === 200 || res.status === 201) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else if (res.status === 422) {
          success = true;
          response = { verified: true, provider: provider.type, note: "API key valid, but sandbox mode rejected (expected)" };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } else if (provider.type === "amazon") {
        const accessKeyId = provider.config?.accessKeyId as string;
        const secretAccessKey = provider.config?.secretAccessKey as string;
        if (!accessKeyId || !secretAccessKey) throw new Error("Missing AWS credentials");
        const { SESClient, GetSendQuotaCommand } = await import("@aws-sdk/client-ses");
        const client = new SESClient({
          region: provider.config?.region || "us-east-1",
          credentials: { accessKeyId, secretAccessKey },
        });
        const result = await client.send(new GetSendQuotaCommand({}));
        success = true;
        response = { verified: true, provider: provider.type, quota: result };
      } else if (provider.type === "mailgun") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const domain = provider.domain || provider.config?.domain as string;
        const res = await fetch(`https://api.mailgun.net/v3/${domain}/stats`, {
          headers: { Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}` },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } else if (provider.type === "postmark") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const serverToken = provider.config?.serverToken as string || apiKey;
        const res = await fetch("https://api.postmarkapp.com/domains", {
          headers: { "X-Postmark-Server-Token": serverToken, Accept: "application/json" },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.Message || `HTTP ${res.status}`);
        }
      } else if (provider.type === "brevo") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.brevo.com/v3/account", {
          headers: { "api-key": apiKey },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${res.status}`);
        }
      } else if (provider.type === "sparkpost") {
        const apiKey = provider.config?.apiKey as string;
        if (!apiKey) throw new Error("Missing API key");
        const res = await fetch("https://api.sparkpost.com/api/v1/account", {
          headers: { Authorization: apiKey },
        });
        if (res.ok) {
          success = true;
          response = { verified: true, provider: provider.type };
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } else {
        success = true;
        response = { verified: true, provider: provider.type, note: "Health check not implemented for this provider type" };
      }
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
    }

    const latencyMs = Date.now() - start;

    const [currentHealth] = await db.select().from(emailProviderHealth).where(eq(emailProviderHealth.providerId, id)).limit(1);
    const lastSuccess = success ? new Date() : currentHealth?.lastSuccessAt || null;
    const lastFailure = success ? currentHealth?.lastFailureAt || null : new Date();

    await db.update(emailProvider)
      .set({
        lastTestedAt: new Date(),
        lastTestStatus: success ? "success" : "error",
        lastTestError: error || null,
        updatedAt: new Date(),
      })
      .where(eq(emailProvider.id, id));

    await db.update(emailProviderHealth)
      .set({
        status: success ? "healthy" : "offline",
        latencyMs,
        lastSuccessAt: lastSuccess,
        lastFailureAt: lastFailure,
        checkedAt: new Date(),
        errorMessage: error || null,
        errorCode: success ? null : "test_connection_failed",
      })
      .where(eq(emailProviderHealth.providerId, id));

    return {
      success,
      latencyMs,
      data: {
        providerId: id,
        providerName: provider.name,
        providerType: provider.type,
        status: success ? "healthy" : "offline",
        testedAt: new Date().toISOString(),
        response,
        error,
      },
    };
  }
}
