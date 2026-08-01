export interface ScoreCategory {
  category: string;
  score: number;
  explanation: string;
  weight: number;
  details: Record<string, unknown>;
}

export class ScoringEngineService {
  calculateScores(inputs: Record<string, number>): ScoreCategory[] {
    const categories: ScoreCategory[] = [];
    const weights: Record<string, number> = {
      image: 0.15,
      video: 0.2,
      brand: 0.15,
      story: 0.15,
      technical: 0.15,
      publishing: 0.1,
      accessibility: 0.05,
      localization: 0.05,
    };

    for (const [key, value] of Object.entries(inputs)) {
      weights[key] = weights[key] ?? 0.1;
    }

    for (const [category, weight] of Object.entries(weights)) {
      const score = inputs[category] ?? 70;
      categories.push({
        category,
        score: Math.min(100, Math.round(score)),
        explanation: this.generateExplanation(category, score),
        weight,
        details: { rawScore: score },
      });
    }

    return categories;
  }

  calculateOverall(scores: ScoreCategory[]): number {
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return 0;
    const weighted = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
    return Math.round(weighted / totalWeight);
  }

  private generateExplanation(category: string, score: number): string {
    if (score >= 85) return `${category}: Excellent quality`;
    if (score >= 70) return `${category}: Good quality`;
    if (score >= 50) return `${category}: Acceptable, needs improvement`;
    return `${category}: Poor quality, requires attention`;
  }
}

export const scoringEngineService = new ScoringEngineService();
