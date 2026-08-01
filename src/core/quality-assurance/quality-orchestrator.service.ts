import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { qualityReport } from "@/lib/db/schema/quality-assurance";
import { imageValidatorService } from "./image-validator.service";
import { videoValidatorService } from "./video-validator.service";
import { brandValidatorService } from "./brand-validator.service";
import { storyValidatorService } from "./story-validator.service";
import { publishingValidatorService } from "./publishing-validator.service";
import { scoringEngineService } from "./scoring-engine.service";
import { recommendationEngineService } from "./recommendation-engine.service";
import { qualityReportService } from "./quality-report.service";
import { qualityRuleService } from "./quality-rule.service";
import { autoRecoveryService } from "./auto-recovery.service";

export interface QAValidationRequest {
  userId: string;
  projectId?: string;
  assetId?: string;
  assetType: "image" | "video" | "story" | "affiliate" | "drama" | "publishing" | "prompt";
  moduleType: string;
  asset: Record<string, unknown>;
  minScore?: number;
}

export class QualityOrchestratorService {
  async runValidation(request: QAValidationRequest): Promise<Record<string, unknown>> {
    const settings = await qualityRuleService.getSettings(request.userId);
    const minScore = request.minScore ?? settings.defaultMinScore ?? 70;
    const validators: Record<string, unknown> = {};
    const issues: string[] = [];

    try {
      if (request.assetType === "image") {
        validators.image = await imageValidatorService.validateImage(request.asset);
        issues.push(...(validators.image as { issues: string[] }).issues);
      }
      if (request.assetType === "video") {
        validators.video = await videoValidatorService.validateVideo(request.asset);
        issues.push(...(validators.video as { issues: string[] }).issues);
      }
    } catch {
      // Validation is best-effort; failures don't block the pipeline
    }

    try {
      validators.brand = await brandValidatorService.validateBrand(request.userId, request.asset);
    } catch {
      validators.brand = { overallBrandScore: 60, issues: [], recommendations: [] };
    }

    try {
      if (request.assetType === "story" || request.assetType === "drama") {
        validators.story = await storyValidatorService.validateStory(request.asset);
        issues.push(...(validators.story as { issues: string[] }).issues);
      }
    } catch {
      // ignore
    }

    try {
      if (request.assetType === "publishing" || request.assetType === "affiliate") {
        validators.publishing = await publishingValidatorService.validatePublishing(request.asset);
        issues.push(...(validators.publishing as { issues: string[] }).issues);
      }
    } catch {
      // ignore
    }

    const scoreInputs: Record<string, number> = {};
    if (validators.image) scoreInputs.image = (validators.image as { overallScore: number }).overallScore;
    if (validators.video) scoreInputs.video = (validators.video as { overallScore: number }).overallScore;
    if (validators.brand) scoreInputs.brand = (validators.brand as { overallBrandScore: number }).overallBrandScore;
    if (validators.story) scoreInputs.story = (validators.story as { overallStoryScore: number }).overallStoryScore;
    if (validators.publishing) scoreInputs.publishing = (validators.publishing as { publishingReadinessScore: number }).publishingReadinessScore;
    scoreInputs.technical = request.asset.technicalScore as number || 80;

    const scoreCategories = scoringEngineService.calculateScores(scoreInputs);
    const overallScore = scoringEngineService.calculateOverall(scoreCategories);
    const passed = overallScore >= minScore;

    const report = await qualityReportService.createReport(request.userId, {
      projectId: request.projectId,
      assetId: request.assetId,
      assetType: request.assetType,
      moduleType: request.moduleType,
      status: passed ? "passed" : "failed",
      overallScore,
      passed,
      requiresReview: !passed,
      summary: passed ? `Validated successfully with score ${overallScore}` : `Validation failed with score ${overallScore} (minimum ${minScore})`,
      scores: scoreInputs,
    });

    for (const sc of scoreCategories) {
      await qualityReportService.addScore(report.id, request.userId, { category: sc.category, score: sc.score, explanation: sc.explanation, weight: sc.weight, details: sc.details });
    }

    const recommendations = await recommendationEngineService.generateRecommendations(report.id, request.userId, scoreInputs, issues);

    const recovery = autoRecoveryService.decide(overallScore, minScore, settings.autoRetryThreshold ?? 50, settings.maxRetryCount ?? 3, 0);
    await db.update(qualityReport).set({ status: recovery.action === "approve" ? "passed" : recovery.action }).where(eq(qualityReport.id, report.id));

    await qualityReportService.logAudit(request.userId, { action: "quality.validate", reportId: report.id, assetId: request.assetId, details: { assetType: request.assetType, overallScore, passed } });

    return {
      reportId: report.id,
      overallScore,
      passed,
      minScore,
      scores: scoreInputs,
      validators,
      recommendations,
      recovery,
    };
  }
}

export const qualityOrchestratorService = new QualityOrchestratorService();
