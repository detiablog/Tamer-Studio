import { db } from "@/lib/db";
import { socialAccount, publishPost, publishJob, publishDraft, publishLog } from "@/lib/db/schema/publishing";
import { eq, and, desc, sql } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { platformRegistry } from "./platform-registry";
import { publishingEngine } from "./publishing.engine";

export interface CreatePostInput {
  title?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  mediaUrls?: string[];
  mediaType?: string;
  link?: string;
  location?: string;
  platformSpecific?: Record<string, Record<string, unknown>>;
}

export interface UpdatePostInput {
  title?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  mediaUrls?: string[];
  mediaType?: string;
  link?: string;
  location?: string;
  platformSpecific?: Record<string, Record<string, unknown>>;
  status?: string;
}

export interface ListFilters {
  status?: string;
  page?: number;
  limit?: number;
}

class PublishingService {
  async listPosts(userId: string, filters: ListFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(publishPost.userId, userId)];
    if (filters.status) {
      conditions.push(eq(publishPost.status, filters.status));
    }

    const where = and(...conditions);

    const [posts, countResult] = await Promise.all([
      db.select().from(publishPost).where(where).orderBy(desc(publishPost.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(publishPost).where(where),
    ]);

    return {
      posts,
      total: countResult[0]?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
    };
  }

  async getPost(id: string) {
    const [post] = await db.select().from(publishPost).where(eq(publishPost.id, id)).limit(1);
    return post || null;
  }

  async createPost(userId: string, input: CreatePostInput) {
    const [post] = await db.insert(publishPost).values({
      id: generateId("ppost"),
      userId,
      title: input.title,
      caption: input.caption,
      hashtags: input.hashtags || [],
      mentions: input.mentions || [],
      mediaUrls: input.mediaUrls || [],
      mediaType: input.mediaType || "image",
      link: input.link,
      location: input.location,
      platformSpecific: input.platformSpecific || {},
      status: "draft",
      createdBy: userId,
    }).returning();
    return post;
  }

  async updatePost(id: string, input: UpdatePostInput) {
    const [post] = await db.select().from(publishPost).where(eq(publishPost.id, id)).limit(1);
    if (!post) return null;

    const [updated] = await db.update(publishPost).set({
      ...input,
      updatedAt: new Date(),
    }).where(eq(publishPost.id, id)).returning();
    return updated;
  }

  async deletePost(id: string) {
    await db.delete(publishPost).where(eq(publishPost.id, id));
  }

  async publishNow(postId: string, socialAccountIds: string[]) {
    const jobs = [];
    for (const accountId of socialAccountIds) {
      const job = await publishingEngine.submitPublishJob(postId, accountId);
      jobs.push(job);
    }

    await db.update(publishPost).set({ status: "publishing", updatedAt: new Date() }).where(eq(publishPost.id, postId));

    const results = [];
    for (const job of jobs) {
      const result = await publishingEngine.processJob(job.id);
      results.push({ jobId: job.id, ...result });
    }

    const allSucceeded = results.every((r) => r.success);
    await db.update(publishPost).set({
      status: allSucceeded ? "published" : "partial",
      updatedAt: new Date(),
    }).where(eq(publishPost.id, postId));

    return results;
  }

  async schedulePost(postId: string, socialAccountIds: string[], scheduledAt: string) {
    const jobs = [];
    for (const accountId of socialAccountIds) {
      const [account] = await db.select().from(socialAccount).where(eq(socialAccount.id, accountId)).limit(1);
      const [job] = await db.insert(publishJob).values({
        id: generateId("pjob"),
        postId,
        socialAccountId: accountId,
        platform: account?.platform || "",
        status: "scheduled",
        scheduledAt: new Date(scheduledAt),
      }).returning();
      jobs.push(job);
    }

    await db.update(publishPost).set({ status: "scheduled", updatedAt: new Date() }).where(eq(publishPost.id, postId));

    return jobs;
  }

  async listAccounts(userId: string) {
    return db.select().from(socialAccount).where(eq(socialAccount.userId, userId)).orderBy(desc(socialAccount.createdAt));
  }

  async getAccount(id: string) {
    const [account] = await db.select().from(socialAccount).where(eq(socialAccount.id, id)).limit(1);
    return account || null;
  }

  async connectAccount(userId: string, platform: string, code: string) {
    const adapter = platformRegistry.getAdapter(platform);
    if (!adapter) throw new Error(`Unsupported platform: ${platform}`);

    const tokenResult = await adapter.connectAccount(code, {});

    const [account] = await db.insert(socialAccount).values({
      id: generateId("sacc"),
      userId,
      platform,
      platformUserId: tokenResult.accountInfo.platformUserId,
      username: tokenResult.accountInfo.username,
      displayName: tokenResult.accountInfo.displayName,
      avatarUrl: tokenResult.accountInfo.avatarUrl,
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      tokenExpiresAt: tokenResult.expiresAt,
    }).returning();

    return account;
  }

  async disconnectAccount(id: string) {
    const [account] = await db.select().from(socialAccount).where(eq(socialAccount.id, id)).limit(1);
    if (!account) return;

    const adapter = platformRegistry.getAdapter(account.platform);
    if (adapter && account.accessToken) {
      await adapter.disconnectAccount(account.accessToken);
    }

    await db.delete(socialAccount).where(eq(socialAccount.id, id));
  }

  async listDrafts(userId: string) {
    return db.select().from(publishDraft).where(eq(publishDraft.userId, userId)).orderBy(desc(publishDraft.createdAt));
  }

  async getDraft(id: string) {
    const [draft] = await db.select().from(publishDraft).where(eq(publishDraft.id, id)).limit(1);
    return draft || null;
  }

  async createDraft(userId: string, input: Partial<CreatePostInput> & { platforms?: string[] }) {
    const [draft] = await db.insert(publishDraft).values({
      id: generateId("pdft"),
      userId,
      title: input.title,
      caption: input.caption,
      hashtags: input.hashtags || [],
      mediaUrls: input.mediaUrls || [],
      mediaType: input.mediaType || "image",
      platforms: input.platforms || [],
    }).returning();
    return draft;
  }

  async updateDraft(id: string, input: Partial<CreatePostInput> & { platforms?: string[] }) {
    const [draft] = await db.select().from(publishDraft).where(eq(publishDraft.id, id)).limit(1);
    if (!draft) return null;

    const [updated] = await db.update(publishDraft).set({
      ...input,
      updatedAt: new Date(),
    }).where(eq(publishDraft.id, id)).returning();
    return updated;
  }

  async deleteDraft(id: string) {
    await db.delete(publishDraft).where(eq(publishDraft.id, id));
  }

  async listJobs(userId: string, filters: ListFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(publishJob.status, filters.status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [jobs, countResult] = await Promise.all([
      db.select().from(publishJob).where(where).orderBy(desc(publishJob.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(publishJob).where(where),
    ]);

    return {
      jobs,
      total: countResult[0]?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
    };
  }

  async getJob(id: string) {
    const [job] = await db.select().from(publishJob).where(eq(publishJob.id, id)).limit(1);
    return job || null;
  }

  async cancelJob(id: string) {
    await publishingEngine.cancelJob(id);
  }

  async getStats(userId: string) {
    const [postCount] = await db.select({ count: sql<number>`count(*)::int` }).from(publishPost).where(eq(publishPost.userId, userId));
    const [publishedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(publishPost).where(and(eq(publishPost.userId, userId), eq(publishPost.status, "published")));
    const [scheduledCount] = await db.select({ count: sql<number>`count(*)::int` }).from(publishPost).where(and(eq(publishPost.userId, userId), eq(publishPost.status, "scheduled")));
    const [draftCount] = await db.select({ count: sql<number>`count(*)::int` }).from(publishDraft).where(eq(publishDraft.userId, userId));
    const [accountCount] = await db.select({ count: sql<number>`count(*)::int` }).from(socialAccount).where(eq(socialAccount.userId, userId));
    const [jobCount] = await db.select({ count: sql<number>`count(*)::int` }).from(publishJob);
    const [failedJobCount] = await db.select({ count: sql<number>`count(*)::int` }).from(publishJob).where(eq(publishJob.status, "failed"));
    const [logs] = await db.select({ count: sql<number>`count(*)::int` }).from(publishLog).where(eq(publishLog.userId, userId));

    return {
      totalPosts: postCount?.count || 0,
      publishedPosts: publishedCount?.count || 0,
      scheduledPosts: scheduledCount?.count || 0,
      draftPosts: draftCount?.count || 0,
      connectedAccounts: accountCount?.count || 0,
      totalJobs: jobCount?.count || 0,
      failedJobs: failedJobCount?.count || 0,
      totalLogs: logs?.count || 0,
    };
  }

  async listLogs(userId: string, filters: { jobId?: string; limit?: number } = {}) {
    const limit = filters.limit || 50;
    const conditions = [eq(publishLog.userId, userId)];
    if (filters.jobId) {
      conditions.push(eq(publishLog.jobId, filters.jobId));
    }
    return db.select().from(publishLog).where(and(...conditions)).orderBy(desc(publishLog.createdAt)).limit(limit);
  }

  getSupportedPlatforms() {
    return platformRegistry.getSupportedPlatforms();
  }
}

export const publishingService = new PublishingService();
