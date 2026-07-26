import type { EmailProvider, EmailStatistics } from "./email.interface";
import { emailLogger } from "./email.logger";

export class EmailStatisticsManager {
  private statsMap: Map<string, EmailStatistics> = new Map();

  recordSend(provider: EmailProvider, success: boolean, latencyMs: number, isBounce = false, isRetry = false): void {
    const today = new Date().toISOString().split("T")[0];
    const key = `${provider.id}:${today}`;
    let stats = this.statsMap.get(key);

    if (!stats) {
      stats = {
        id: `stats_${provider.id}_${today}`,
        providerId: provider.id,
        date: new Date(today),
        sent: 0,
        delivered: 0,
        failed: 0,
        retry: 0,
        bounce: 0,
        quotaUsed: 0,
        quotaTotal: 0,
        avgLatencyMs: 0,
      };
      this.statsMap.set(key, stats);
    }

    const currentSent = stats.sent;
    stats.sent += 1;
    if (success) {
      stats.delivered += 1;
    } else {
      stats.failed += 1;
    }
    if (isBounce) stats.bounce += 1;
    if (isRetry) stats.retry += 1;

    const totalLatency = (stats.avgLatencyMs || 0) * currentSent + latencyMs;
    stats.avgLatencyMs = Math.round(totalLatency / stats.sent);

    emailLogger.debug("Statistics recorded", {
      providerId: provider.id,
      sent: stats.sent,
      delivered: stats.delivered,
      failed: stats.failed,
    });
  }

  recordQuota(provider: EmailProvider, quota: { used: number; total: number }): void {
    const today = new Date().toISOString().split("T")[0];
    const key = `${provider.id}:${today}`;
    const stats = this.statsMap.get(key);
    if (stats) {
      stats.quotaUsed = quota.used;
      stats.quotaTotal = quota.total;
    }
  }

  getStatistics(providerId?: string, date?: Date): EmailStatistics[] {
    const result: EmailStatistics[] = [];
    this.statsMap.forEach((stats) => {
      if (providerId && stats.providerId !== providerId) return;
      if (date) {
        const statDate = new Date(stats.date).toDateString();
        const targetDate = new Date(date).toDateString();
        if (statDate !== targetDate) return;
      }
      result.push({ ...stats });
    });
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getDailyTotals(date?: Date): {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalBounce: number;
    totalRetry: number;
    providers: { providerId: string; sent: number; delivered: number; failed: number }[];
  } {
    const targetDate = date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    let totals = { totalSent: 0, totalDelivered: 0, totalFailed: 0, totalBounce: 0, totalRetry: 0 };
    const providerMap = new Map<string, { sent: number; delivered: number; failed: number }>();

    this.statsMap.forEach((stats) => {
      const statDate = new Date(stats.date).toISOString().split("T")[0];
      if (statDate !== targetDate) return;
      totals.totalSent += stats.sent;
      totals.totalDelivered += stats.delivered;
      totals.totalFailed += stats.failed;
      totals.totalBounce += stats.bounce;
      totals.totalRetry += stats.retry;
      if (stats.providerId) {
        const current = providerMap.get(stats.providerId) || { sent: 0, delivered: 0, failed: 0 };
        current.sent += stats.sent;
        current.delivered += stats.delivered;
        current.failed += stats.failed;
        providerMap.set(stats.providerId, current);
      }
    });

    return {
      ...totals,
      providers: Array.from(providerMap.entries()).map(([providerId, data]) => ({ providerId, ...data })),
    };
  }
}

export const emailStatisticsManager = new EmailStatisticsManager();
