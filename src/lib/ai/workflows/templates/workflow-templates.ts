import type { WorkflowTemplate } from "../types";

export type { WorkflowTemplate } from "../types";

export interface WorkflowTemplateLoader {
  loadTemplates(): Promise<WorkflowTemplate[]>;
  getTemplate(templateId: string): Promise<WorkflowTemplate | undefined>;
  saveTemplate(template: WorkflowTemplate): Promise<void>;
}

export class InMemoryWorkflowTemplateLoader implements WorkflowTemplateLoader {
  private templates: Map<string, WorkflowTemplate> = new Map();

  async loadTemplates(): Promise<WorkflowTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(templateId: string): Promise<WorkflowTemplate | undefined> {
    return this.templates.get(templateId);
  }

  async saveTemplate(template: WorkflowTemplate): Promise<void> {
    this.templates.set(template.id, template);
  }
}

export const defaultWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: "affiliate-production",
    name: "Affiliate Production",
    description: "Complete affiliate content production workflow",
    category: "affiliate",
    definition: {
      id: "affiliate-production",
      name: "Affiliate Production",
      description: "Generate affiliate script, media, captions, and publish",
      version: "1.0.0",
      nodes: [],
      edges: [],
      variables: [],
      tags: ["affiliate", "production"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tags: ["affiliate", "production"],
  },
  {
    id: "drama-production",
    name: "Drama Production",
    description: "Complete drama content production workflow",
    category: "drama",
    definition: {
      id: "drama-production",
      name: "Drama Production",
      description: "Generate drama script, storyboard, media, and export",
      version: "1.0.0",
      nodes: [],
      edges: [],
      variables: [],
      tags: ["drama", "production"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tags: ["drama", "production"],
  },
];
