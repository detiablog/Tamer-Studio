import type { NotificationTemplate, TemplateVersion } from "./template.types";
import { logAction } from "@/core/audit";
import { NotificationTemplateRepository } from "./template.repository";

export class NotificationTemplateService {
  private repository = new NotificationTemplateRepository();

  async create(input: Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">): Promise<NotificationTemplate> {
    const template = await this.repository.create(input);
    await logAction("notification.template.created", undefined, undefined, { templateId: template.id, name: input.name });
    return template;
  }

  async getById(id: string): Promise<NotificationTemplate | undefined> {
    return this.repository.getById(id);
  }

  async getByName(name: string): Promise<NotificationTemplate | undefined> {
    return this.repository.getByName(name);
  }

  async list(filters?: {
    category?: string;
    channel?: string;
    locale?: string;
    isActive?: boolean;
  }): Promise<NotificationTemplate[]> {
    return this.repository.list(filters);
  }

  async update(id: string, input: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new Error("Template not found");

    const newVersion = input.body !== undefined && input.body !== existing.body ? existing.version + 1 : existing.version;
    const updated = await this.repository.update(id, { ...input, version: newVersion });
    await logAction("notification.template.updated", undefined, undefined, { templateId: id, version: newVersion });
    return updated;
  }

  async activate(id: string): Promise<NotificationTemplate> {
    const updated = await this.repository.activate(id);
    await logAction("notification.template.activated", undefined, undefined, { templateId: id });
    return updated;
  }

  async deactivate(id: string): Promise<NotificationTemplate> {
    const updated = await this.repository.deactivate(id);
    await logAction("notification.template.deactivated", undefined, undefined, { templateId: id });
    return updated;
  }

  async addVersion(id: string, body: string, subject?: string): Promise<NotificationTemplate> {
    const existing = await this.repository.getById(id);
    if (!existing) throw new Error("Template not found");

    const updated = await this.repository.addVersion(id, body, subject);
    await logAction("notification.template.updated", undefined, undefined, { templateId: id, version: updated.version });
    return updated;
  }

  async getVersions(id: string): Promise<TemplateVersion[]> {
    return this.repository.getVersions(id);
  }
}
