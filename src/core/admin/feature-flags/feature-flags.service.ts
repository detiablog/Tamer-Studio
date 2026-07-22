import type { FeatureFlag, FeatureFlagInput, FeatureFlagEvaluation } from "./feature-flags.types";
import { logAdminAction } from "@/core/audit";
import { logger } from "@/core/logger";

const flagStore: Map<string, FeatureFlag> = new Map();

export class FeatureFlagsService {
  async createFlag(input: FeatureFlagInput, adminId: string): Promise<FeatureFlag> {
    const now = new Date();
    const flag: FeatureFlag = {
      ...input,
      id: `flag_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId,
    };
    flagStore.set(flag.key, flag);
    logAdminAction("feature.flag.created", adminId, { key: flag.key, enabled: flag.enabled });
    logger.info("Feature flag created", { key: flag.key, enabled: flag.enabled });
    return flag;
  }

  async updateFlag(key: string, data: Partial<FeatureFlagInput>, adminId: string): Promise<FeatureFlag | undefined> {
    const existing = flagStore.get(key);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    flagStore.set(key, updated);
    logAdminAction("feature.flag.updated", adminId, { key, changes: data });
    logger.info("Feature flag updated", { key });
    return updated;
  }

  async deleteFlag(key: string, adminId: string): Promise<void> {
    flagStore.delete(key);
    logAdminAction("feature.flag.deleted", adminId, { key });
    logger.info("Feature flag deleted", { key });
  }

  async getFlag(key: string): Promise<FeatureFlag | undefined> {
    return flagStore.get(key);
  }

  async listFlags(): Promise<FeatureFlag[]> {
    return Array.from(flagStore.values());
  }

  async isEnabled(key: string, workspaceId?: string, userId?: string): Promise<boolean> {
    const flag = flagStore.get(key);
    if (!flag) return false;

    if (flag.scheduledAt && flag.scheduledAt > new Date()) {
      return false;
    }
    if (flag.expiresAt && flag.expiresAt < new Date()) {
      return false;
    }

    if (flag.scope === "global") {
      return flag.enabled;
    }

    if (flag.scope === "workspace" && workspaceId && flag.targetId === workspaceId) {
      if (flag.rolloutPercentage !== undefined) {
        return this.evaluateRollout(workspaceId, flag.rolloutPercentage);
      }
      return flag.enabled;
    }

    if (flag.scope === "user" && userId && flag.targetId === userId) {
      if (flag.rolloutPercentage !== undefined) {
        return this.evaluateRollout(userId, flag.rolloutPercentage);
      }
      return flag.enabled;
    }

    return false;
  }

  async evaluate(key: string, context: { workspaceId?: string; userId?: string }): Promise<FeatureFlagEvaluation> {
    const flag = flagStore.get(key);
    if (!flag) {
      return { flag: this.createDefaultFlag(key), result: false, reason: "Flag not found" };
    }

    const result = await this.isEnabled(key, context.workspaceId, context.userId);
    return {
      flag,
      result,
      reason: result ? "Flag enabled" : "Flag disabled",
    };
  }

  async activateFlag(key: string, adminId: string): Promise<void> {
    await this.updateFlag(key, { enabled: true }, adminId);
  }

  async deactivateFlag(key: string, adminId: string): Promise<void> {
    await this.updateFlag(key, { enabled: false }, adminId);
  }

  async setRollout(key: string, percentage: number, adminId: string): Promise<void> {
    await this.updateFlag(key, { rolloutPercentage: Math.max(0, Math.min(100, percentage)) }, adminId);
  }

  async scheduleActivation(key: string, scheduledAt: Date, adminId: string): Promise<void> {
    await this.updateFlag(key, { enabled: false, scheduledAt }, adminId);
  }

  private evaluateRollout(targetId: string, percentage: number): boolean {
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;
    const hash = this.hashString(targetId);
    const bucket = hash % 100;
    return bucket < percentage;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private createDefaultFlag(key: string): FeatureFlag {
    return {
      id: `flag_${key}`,
      key,
      description: "",
      enabled: false,
      scope: "global",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
