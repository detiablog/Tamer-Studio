import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from "./organization.types";
import { OrganizationRepository } from "./organization.repository";
import { logAction } from "@/core/audit";

export class OrganizationService {
  private repository = new OrganizationRepository();

  async listOrganizations(): Promise<Organization[]> {
    return this.repository.getOrganizationsByOwner("user_admin_default");
  }

  async getOrganization(organizationId: string): Promise<Organization> {
    const org = await this.repository.getOrganization(organizationId);
    if (!org) throw new Error("Organization not found");
    return org;
  }

  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    const org = await this.repository.createOrganization(input);
    logAction("organization.created", undefined, undefined, { organizationId: org.id, ownerId: input.ownerId });
    return org;
  }

  async updateOrganization(organizationId: string, input: UpdateOrganizationInput): Promise<Organization> {
    const org = await this.repository.updateOrganization(organizationId, input);
    logAction("organization.updated", undefined, undefined, { organizationId, changes: input });
    return org;
  }

  async deleteOrganization(organizationId: string): Promise<boolean> {
    const deleted = await this.repository.deleteOrganization(organizationId);
    if (deleted) {
      logAction("organization.deleted", undefined, undefined, { organizationId });
    }
    return deleted;
  }
}
