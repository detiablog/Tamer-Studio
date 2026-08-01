export interface StoryValidationResult {
  timelineConsistency: number;
  characterConsistency: number;
  relationshipConsistency: number;
  locationConsistency: number;
  objectConsistency: number;
  dialogueStyle: number;
  episodeContinuity: number;
  ruleCompliance: number;
  overallStoryScore: number;
  issues: string[];
  recommendations: string[];
}

export class StoryValidatorService {
  async validateStory(asset: Record<string, unknown>): Promise<StoryValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const timelineConsistency = (asset.timelineConsistency as number) || 75;
    const characterConsistency = (asset.characterConsistency as number) || 75;
    const relationshipConsistency = (asset.relationshipConsistency as number) || 70;
    const locationConsistency = (asset.locationConsistency as number) || 70;
    const objectConsistency = (asset.objectConsistency as number) || 70;
    const dialogueStyle = (asset.dialogueStyle as number) || 70;
    const episodeContinuity = (asset.episodeContinuity as number) || 70;
    const ruleCompliance = (asset.ruleCompliance as number) || 75;

    if (characterConsistency < 50) {
      issues.push("Character inconsistencies detected");
      recommendations.push("Re-verify character appearance with references");
    }
    if (timelineConsistency < 50) {
      issues.push("Timeline inconsistencies");
      recommendations.push("Review the story timeline for order errors");
    }
    if (episodeContinuity < 50) {
      issues.push("Episode continuity issues");
      recommendations.push("Check previous episode endings against new content");
    }
    if (ruleCompliance < 50) {
      issues.push("Story rules may be violated");
      recommendations.push("Validate content against story rules");
    }

    const overallStoryScore = Math.round(
      timelineConsistency * 0.15 +
        characterConsistency * 0.2 +
        relationshipConsistency * 0.1 +
        locationConsistency * 0.1 +
        objectConsistency * 0.05 +
        dialogueStyle * 0.1 +
        episodeContinuity * 0.2 +
        ruleCompliance * 0.1
    );

    return {
      timelineConsistency,
      characterConsistency,
      relationshipConsistency,
      locationConsistency,
      objectConsistency,
      dialogueStyle,
      episodeContinuity,
      ruleCompliance,
      overallStoryScore,
      issues,
      recommendations,
    };
  }
}

export const storyValidatorService = new StoryValidatorService();
