import type { PlanRepository, Plan } from "../../types/billing";

export class InMemoryPlanRepository implements PlanRepository {
  private plans: Map<string, Plan> = new Map();

  async getPlan(planId: string): Promise<Plan | undefined> {
    return this.plans.get(planId);
  }

  async listPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async createPlan(plan: Plan): Promise<Plan> {
    this.plans.set(plan.id, plan);
    return plan;
  }
}
