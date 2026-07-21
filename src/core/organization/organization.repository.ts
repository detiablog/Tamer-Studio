import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema/identity";
import { eq, desc } from "drizzle-orm";
import type { Organization, CreateOrganizationInput, UpdateOrganizationInput } from "./organization.types";
import { randomUUID } from "crypto";
import { logAction } from "@/core/audit";

export class OrganizationRepository {
  async getOrganization(organizationId: string): Promise<Organization | undefined> {
    const rows = await db.select().from(organization).where(eq(organization.id, organizationId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapOrganization(rows[0]);
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    const rows = await db.select().from(organization).where(eq(organization.ownerId, ownerId)).orderBy(desc(organization.createdAt));
    return rows.map(this.mapOrganization);
  }

  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    const id = `org_${randomUUID()}`;
    const now = new Date();
    const org: Organization = {
      id,
      name: input.name,
      slug: input.slug,
      ownerId: input.ownerId,
      settings: input.settings ?? {},
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(organization).values({
      id,
      name: input.name,
      slug: input.slug,
      ownerId: input.ownerId,
      settings: org.settings,
      status: org.status,
      createdAt: now,
      updatedAt: now,
    });
    logAction("organization.created", undefined, undefined, {  organizationId: id, ownerId: input.ownerId  });
    return org;
  }

  async updateOrganization(organizationId: string, input: UpdateOrganizationInput): Promise<Organization> {
    const existing = await this.getOrganization(organizationId);
    if (!existing) throw new Error("Organization not found");
    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (input.name !== undefined) updates.name = input.name;
    if (input.settings !== undefined) updates.settings = input.settings;
    if (input.status !== undefined) updates.status = input.status;
    await db.update(organization).set(updates).where(eq(organization.id, organizationId));
    logAction("organization.updated", undefined, undefined, {  organizationId, changes: input  });
    return { ...existing, ...updates } as Organization;
  }

  private mapOrganization(row: typeof organization.$inferSelect): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      ownerId: row.ownerId,
      settings: row.settings as Record<string, unknown>,
      status: row.status as Organization["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
