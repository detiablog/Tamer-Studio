export type CMSPageStatus = "draft" | "published" | "archived" | "scheduled";
export type CMSPermission = "admin" | "editor" | "author" | "viewer";
export type CMSContentType = "page" | "section" | "block" | "component" | "media" | "template";
export type ComponentType = "hero" | "features" | "cta" | "testimonials" | "faq" | "pricing" | "footer" | "header" | "custom";

export interface ComponentSchema {
  properties: Record<string, {
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    default?: unknown;
    label?: string;
    placeholder?: string;
  }>;
  requiredLocales?: string[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  type: ComponentType;
  schema: ComponentSchema;
  preview?: string;
  localization: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  status: CMSPageStatus;
  contentType: CMSContentType;
  parentId?: string;
  seo: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonical?: string;
    robots?: string;
  };
  localization: {
    locale: string;
    fallbackLocale: string;
    translations: Record<string, Record<string, string>>;
  };
  permissions: {
    read: CMSPermission[];
    write: CMSPermission[];
    publish: CMSPermission[];
  };
  version: number;
  publishedVersion?: number;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  authorId: string;
}

export interface CMSSection {
  id: string;
  pageId: string;
  sectionKey: string;
  type: string;
  title: string;
  description?: string;
  component?: string;
  order: number;
  visible: boolean;
  locked: boolean;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  media: CMSMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface CMSBlock {
  id: string;
  sectionId: string;
  type: string;
  properties: Record<string, unknown>;
  order: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CMSComponent {
  id: string;
  name: string;
  type: string;
  schema: Record<string, unknown>;
  preview?: string;
  localization: boolean;
  permissions: CMSPermission[];
  createdAt: string;
  updatedAt: string;
}

export interface CMSMedia {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  type: string;
  size: number;
  folder?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CMSVersion {
  id: string;
  contentId: string;
  contentType: CMSContentType;
  version: number;
  data: Record<string, unknown>;
  authorId: string;
  createdAt: string;
  message?: string;
}

export interface CMSPublishPipeline {
  id: string;
  contentId: string;
  contentType: CMSContentType;
  status: "pending" | "validating" | "publishing" | "published" | "failed";
  steps: CMSPublishStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CMSPublishStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface CMSCreatePageInput {
  title: string;
  slug: string;
  status?: CMSPageStatus;
  contentType?: CMSContentType;
  parentId?: string;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonical?: string;
    robots?: string;
  };
  localization?: Partial<CMSPage["localization"]>;
  permissions?: Partial<CMSPage["permissions"]>;
  authorId: string;
}

export interface CMSUpdatePageInput {
  title?: string;
  slug?: string;
  status?: CMSPageStatus;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
    canonical?: string;
    robots?: string;
  };
  localization?: Partial<CMSPage["localization"]>;
  permissions?: Partial<CMSPage["permissions"]>;
  publishedVersion?: number;
  scheduledAt?: string;
}

export interface CMSAuditEntry {
  id: string;
  action: "create" | "edit" | "publish" | "rollback" | "delete" | "restore";
  contentType: CMSContentType;
  contentId: string;
  authorId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}