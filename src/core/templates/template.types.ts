export type TemplateCategory = "system" | "billing" | "ai" | "workflow" | "security" | "marketing";
export type TemplateChannel = "email" | "sms" | "push" | "in_app";

export interface TemplateVariable {
  name: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface TemplateVersion {
  version: number;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  createdAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  channel: TemplateChannel;
  subject?: string;
  body: string;
  variables: TemplateVariable[];
  locale: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RenderTemplateInput {
  templateId: string;
  variables: Record<string, string>;
  locale?: string;
}

export interface RenderedTemplate {
  subject?: string;
  body: string;
  locale: string;
}
