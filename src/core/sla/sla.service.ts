import type { SLAPolicy, SLAViolation, CreateSLAPolicyInput, SLAPriority, SLAType, SLACheckResult } from "./types";
import { SLARepository } from "./sla.repository";
import { logAction } from "@/core/audit";
import { logger } from "@/core/logger";
import type { EventPublisher } from "@/core/events";

export class SLAService {
  private policies: SLAPolicy[] = [];
  private repository = new SLARepository();

  constructor(private eventPublisher?: EventPublisher) {
    this.policies = [
      { id: "sla_low", name: "Low Priority SLA", priority: "low", responseTimeMinutes: 1440, resolutionTimeMinutes: 4320, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "sla_medium", name: "Medium Priority SLA", priority: "medium", responseTimeMinutes: 480, resolutionTimeMinutes: 1440, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "sla_high", name: "High Priority SLA", priority: "high", responseTimeMinutes: 120, resolutionTimeMinutes: 480, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "sla_urgent", name: "Urgent Priority SLA", priority: "urgent", responseTimeMinutes: 30, resolutionTimeMinutes: 120, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ];
  }

  async createPolicy(input: CreateSLAPolicyInput): Promise<SLAPolicy> {
    const policy = await this.repository.createPolicy(input);
    this.policies.push(policy);
    logAction("sla.policy.created", undefined, undefined, { policyId: policy.id, priority: policy.priority });
    logger.info("SLA policy created", { policyId: policy.id });
    return policy;
  }

  async getPolicies(): Promise<SLAPolicy[]> {
    return this.repository.getPolicies();
  }

  async getPolicy(id: string): Promise<SLAPolicy | undefined> {
    return this.repository.getPolicy(id);
  }

  async getPolicyByPriority(priority: SLAPriority): Promise<SLAPolicy | undefined> {
    const dbPolicy = await this.repository.getPolicyByPriority(priority);
    if (dbPolicy) return dbPolicy;
    return this.policies.find((p) => p.priority === priority);
  }

  async updatePolicy(id: string, input: Partial<CreateSLAPolicyInput>): Promise<SLAPolicy | undefined> {
    const policy = await this.repository.updatePolicy(id, input);
    if (policy) {
      const index = this.policies.findIndex((p) => p.id === id);
      if (index !== -1) this.policies[index] = policy;
      logAction("sla.policy.updated", undefined, undefined, { policyId: id });
      logger.info("SLA policy updated", { policyId: id });
    }
    return policy;
  }

  async checkTicketSLA(ticketId: string): Promise<SLACheckResult> {
    return this.repository.checkTicketSLA(ticketId);
  }

  async recordViolation(ticketId: string, policyId: string, type: SLAType): Promise<SLAViolation> {
    const violation = await this.repository.recordViolation(ticketId, policyId, type);
    logAction("sla.violation.recorded", undefined, undefined, { violationId: violation.id, ticketId, type });
    logger.warn("SLA violation recorded", { violationId: violation.id, ticketId, type });

    if (this.eventPublisher) {
      await this.eventPublisher.publishDomainEvent("sla.violated", { violationId: violation.id, ticketId, type }, "support", { resourceId: ticketId, resourceType: "ticket" });
    }

    return violation;
  }

  async getViolations(ticketId?: string): Promise<SLAViolation[]> {
    return this.repository.getViolations(ticketId);
  }
}
