import type { PromptTemplate, PromptTemplateVersion, PromptCategory } from "./types";

export interface PromptTemplateRegistry {
  register(template: PromptTemplate): void;
  registerMany(templates: PromptTemplate[]): void;
  resolve(templateId: string): PromptTemplate | undefined;
  has(templateId: string): boolean;
  list(): PromptTemplate[];
  listByCategory(category: PromptCategory): PromptTemplate[];
  addVersion(templateId: string, version: PromptTemplateVersion): void;
  getVersions(templateId: string): PromptTemplateVersion[];
  getLatestVersion(templateId: string): PromptTemplateVersion | undefined;
  delete(templateId: string): void;
}

export class InMemoryPromptTemplateRegistry implements PromptTemplateRegistry {
  private templates: Map<string, PromptTemplate> = new Map();
  private versions: Map<string, PromptTemplateVersion[]> = new Map();

  register(template: PromptTemplate): void {
    if (this.templates.has(template.id)) {
      throw new Error(`Template ${template.id} is already registered`);
    }
    this.templates.set(template.id, template);
    this.ensureVersion(template);
  }

  registerMany(templates: PromptTemplate[]): void {
    for (const template of templates) {
      this.register(template);
    }
  }

  resolve(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  has(templateId: string): boolean {
    return this.templates.has(templateId);
  }

  list(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  listByCategory(category: PromptCategory): PromptTemplate[] {
    return this.list().filter((template) => template.category === category);
  }

  addVersion(templateId: string, version: PromptTemplateVersion): void {
    const existing = this.versions.get(templateId) ?? [];
    existing.push(version);
    this.versions.set(templateId, existing);
  }

  getVersions(templateId: string): PromptTemplateVersion[] {
    return this.versions.get(templateId) ?? [];
  }

  getLatestVersion(templateId: string): PromptTemplateVersion | undefined {
    const versions = this.getVersions(templateId);
    if (versions.length === 0) return undefined;
    return versions[versions.length - 1];
  }

  delete(templateId: string): void {
    this.templates.delete(templateId);
    this.versions.delete(templateId);
  }

  private ensureVersion(template: PromptTemplate): void {
    const version: PromptTemplateVersion = {
      id: `${template.id}@${template.version}`,
      templateId: template.id,
      version: template.version,
      content: template.content,
      variables: template.variables,
      createdAt: template.createdAt,
    };

    const existing = this.versions.get(template.id) ?? [];
    if (!existing.some((v) => v.version === template.version)) {
      existing.push(version);
      this.versions.set(template.id, existing);
    }
  }
}
