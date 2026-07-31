import { platformRegistry } from "./platform-registry";
import { db } from "@/lib/db";
import { publishJob, publishPost, publishLog, socialAccount } from "@/lib/db/schema/publishing";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export class PublishingEngine {
  async submitPublishJob(postId: string, socialAccountId: string) {
    const [account] = await db.select().from(socialAccount).where(eq(socialAccount.id, socialAccountId)).limit(1);
    const [job] = await db.insert(publishJob).values({
      id: generateId("pjob"),
      postId,
      socialAccountId,
      platform: account?.platform || "",
      status: "queued",
    }).returning();
    return job;
  }

  async processJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    const [job] = await db.select().from(publishJob).where(eq(publishJob.id, jobId)).limit(1);
    if (!job) return { success: false, error: "Job not found" };

    const [account] = await db.select().from(socialAccount).where(eq(socialAccount.id, job.socialAccountId)).limit(1);
    if (!account) return { success: false, error: "Social account not found" };

    await db.update(publishJob).set({ status: "publishing", updatedAt: new Date() }).where(eq(publishJob.id, jobId));

    try {
      const adapter = platformRegistry.getAdapter(account.platform);
      if (!adapter) throw new Error(`No adapter for platform: ${account.platform}`);

      const [post] = await db.select().from(publishPost).where(eq(publishPost.id, job.postId)).limit(1);
      if (!post) throw new Error("Post not found");

      const result = await adapter.publish({
        caption: post.caption || "",
        mediaUrls: (post.mediaUrls as string[]) || [],
        mediaType: post.mediaType,
        hashtags: (post.hashtags as string[]) || [],
        mentions: (post.mentions as string[]) || [],
        link: post.link || undefined,
      }, account.accessToken || "");

      if (result.success) {
        await db.update(publishJob).set({
          status: "published",
          publishedAt: new Date(),
          platformPostId: result.platformPostId,
          platformUrl: result.platformUrl,
          response: result.response || {},
          updatedAt: new Date(),
        }).where(eq(publishJob.id, jobId));

        await this.log("published", job.postId, jobId, account.userId, account.platform);
        return { success: true };
      } else {
        throw new Error(result.error || "Publish failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const newRetryCount = job.retryCount + 1;

      if (newRetryCount >= job.maxRetries) {
        await db.update(publishJob).set({
          status: "failed",
          error: errorMessage,
          retryCount: newRetryCount,
          updatedAt: new Date(),
        }).where(eq(publishJob.id, jobId));
      } else {
        await db.update(publishJob).set({
          status: "queued",
          retryCount: newRetryCount,
          error: errorMessage,
          updatedAt: new Date(),
        }).where(eq(publishJob.id, jobId));
      }

      await this.log("failed", job.postId, jobId, account.userId, account.platform, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async cancelJob(jobId: string) {
    await db.update(publishJob).set({ status: "cancelled", updatedAt: new Date() }).where(eq(publishJob.id, jobId));
  }

  private async log(eventType: string, postId: string | null, jobId: string | null, userId: string, platform: string, description?: string) {
    await db.insert(publishLog).values({
      id: generateId("plog"),
      jobId,
      postId,
      userId,
      eventType,
      platform,
      description: description || null,
    });
  }
}

export const publishingEngine = new PublishingEngine();
