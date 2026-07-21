import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from "./organization.types";
import { OrganizationRepository } from "./organization.repository";

export class OrganizationService {
  private repository = new OrganizationRepository();

  async getOrganization(organizationId: string): Promise<Organization> {
    const org = await this.repository.getOrganization(organizationId);
    if (!org) throw new Error("Organization not found");
    return org;
  }

  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    return this.repository.createOrganization(input);
  }

  async updateOrganization(organizationId: string, input: UpdateOrganizationInput): Promise<Organization> {
    return this.repository.updateOrganization(organizationId, input);
  }
}
