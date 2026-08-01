import { db } from "@/lib/db";
import { qualityRetryHistory } from "@/lib/db/schema/quality-assurance";
import { eq, desc, sql, and } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";

export interface RecoveryDecision {
  action: "approve" | "regenerate" | "manual_review" | "stop";
  reason: string;
  retryCount?: number;
}

export class AutoRecoveryService {
  decide(overallScore: number, minScore: number, autoRetryThreshold: number, maxRetryCount: number, currentRetryCount: number): RecoveryDecision {
    if (overallScore >= minScore) {
      return { action: "approve", reason: `Score ${overallScore} meets minimum ${minScore}` };
    }

    if (overallScore >= autoRetryThreshold && currentRetryCount < maxRetryCount) {
      return { action: "regenerate", reason: `Score ${overallScore} below minimum but above retry threshold`, retryCount: currentRetryCount + 1 };
    }

    if (overallScore < autoRetryThreshold && currentRetryCount < maxRetryCount) {
      return { action: "regenerate", reason: `Score ${overallScore} in retry range`, retryCount: currentRetryCount + 1 };
    }

    if (currentRetryCount >= maxRetryCount) {
      return { action: "manual_review", reason: `Max retries (${maxRetryCount}) reached`, retryCount: currentRetryCount };
    }

    return { action: "stop", reason: "Unable to recover automatically" };
  }

  async recordRetry(reportId: string, userId: string, data: { assetId?: string; retryCount: number; reason: string; status?: string; provider?: string; model?: string; scoreBefore?: number; scoreAfter?: number; metadata?: Record<string, unknown> }) {
    const id = generateId("qauto");
    return db.insert(qualityRetryHistory).values({ ...data, id, reportId, userId }).returning().then(r => r[0]);
  }

  async getRetryHistory(reportId: string) {
    return db.select().from(qualityRetryHistory).where(eq(qualityRetryHistory.reportId, reportId)).orderBy(desc(qualityRetryHistory.createdAt));
  }
}

export const autoRecoveryService = new AutoRecoveryService();
