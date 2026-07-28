import type { CMSPublishPipeline, CMSPublishStep } from "../cms.types";

export interface CMSPublishRepository {
  createPipeline(pipeline: CMSPublishPipeline): Promise<CMSPublishPipeline>;
  getPipeline(id: string): Promise<CMSPublishPipeline | undefined>;
  getPipelinesByContentId(contentId: string): Promise<CMSPublishPipeline[]>;
  updatePipeline(id: string, updates: Partial<CMSPublishPipeline>): Promise<CMSPublishPipeline | undefined>;
  createStep(step: CMSPublishStep): Promise<CMSPublishStep>;
  updateStep(id: string, updates: Partial<CMSPublishStep>): Promise<CMSPublishStep | undefined>;
  getStepsByPipelineId(pipelineId: string): Promise<CMSPublishStep[]>;
}
