import { db } from "@/lib/db";
import { orchestratorPipelineStep } from "@/lib/db/schema/orchestrator";
import { eq } from "drizzle-orm";

export class ResourceEstimatorService {
  private creditEstimates: Record<string, number> = {
    image_generation: 5,
    video_generation: 25,
    text_generation: 2,
    audio_generation: 10,
    trend_analysis: 3,
    content_optimization: 4,
    publishing: 1,
    data_collection: 2,
    analytics: 2,
  };

  private durationEstimates: Record<string, number> = {
    image_generation: 30000,
    video_generation: 120000,
    text_generation: 10000,
    audio_generation: 60000,
    trend_analysis: 15000,
    content_optimization: 20000,
    publishing: 5000,
    data_collection: 10000,
    analytics: 8000,
  };

  async estimatePipeline(pipelineId: string) {
    const steps = await db
      .select()
      .from(orchestratorPipelineStep)
      .where(eq(orchestratorPipelineStep.pipelineId, pipelineId))
      .orderBy(orchestratorPipelineStep.order);

    let totalCredits = 0;
    let totalDurationMs = 0;

    const stepEstimates = steps.map((step) => {
      const credits = this.creditEstimates[step.moduleType] || 2;
      const duration = this.durationEstimates[step.moduleType] || 10000;
      totalCredits += credits;
      totalDurationMs += duration;
      return {
        stepId: step.id,
        name: step.name,
        moduleType: step.moduleType,
        action: step.action,
        estimatedCredits: credits,
        estimatedDurationMs: duration,
      };
    });

    return {
      totalCredits,
      totalDurationMs,
      stepCount: steps.length,
      steps: stepEstimates,
    };
  }

  estimateModuleCredits(moduleType: string) {
    return this.creditEstimates[moduleType] || 2;
  }

  estimateModuleDuration(moduleType: string) {
    return this.durationEstimates[moduleType] || 10000;
  }
}

export const resourceEstimatorService = new ResourceEstimatorService();
