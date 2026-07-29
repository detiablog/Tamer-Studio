export function mapCMSSectionToLanding(section: {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}): {
  id: string;
  sectionKey: string;
  title: string;
  description: string | null;
  component: string;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  media: Array<{ id: string; url: string; alt: string; type: string; order: number }>;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: section.id,
    sectionKey: section.sectionKey,
    title: section.title,
    description: section.description ?? null,
    component: section.component ?? "",
    type: section.type,
    visible: section.visible,
    locked: section.locked,
    order: section.order,
    config: section.config ?? {},
    styles: section.styles ?? {},
    media: [],
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  };
}
