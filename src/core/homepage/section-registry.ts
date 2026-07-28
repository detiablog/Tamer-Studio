import type {
  SectionRegistrationInput,
  HomepageSectionDefinition,
  SectionConditionalRule,
} from "./homepage.types";

export interface SectionRegistryEntry {
  sectionKey: string;
  type: string;
  component: string;
  title: string;
  description?: string;
  order: number;
  visible: boolean;
  locked: boolean;
  visibility: "public" | "authenticated" | "admin";
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  permissions: string[];
  featureFlags: string[];
  localization: {
    namespace: string;
    fallbackLocale: string;
    translations: Record<string, Record<string, string>>;
  };
  fallbackSection?: string;
  conditionalRules?: SectionConditionalRule[];
  registeredAt: string;
  updatedAt: string;
}

export class SectionRegistry {
  private sections: Map<string, SectionRegistryEntry> = new Map();
  private orderIndex: string[] = [];

  register(input: SectionRegistrationInput): SectionRegistryEntry {
    const now = new Date().toISOString();
    const existing = this.sections.get(input.sectionKey);

    const entry: SectionRegistryEntry = {
      sectionKey: input.sectionKey,
      type: input.type,
      component: input.component,
      title: input.title,
      description: input.description,
      order: input.order ?? (existing?.order ?? this.sections.size),
      visible: input.visible ?? true,
      locked: input.locked ?? false,
      visibility: input.visibility ?? "public",
      config: input.config ?? existing?.config ?? {},
      styles: input.styles ?? existing?.styles ?? {},
      permissions: input.permissions ?? existing?.permissions ?? [],
      featureFlags: input.featureFlags ?? existing?.featureFlags ?? [],
      localization: {
        namespace: input.localization?.namespace ?? existing?.localization?.namespace ?? "homepage",
        fallbackLocale: input.localization?.fallbackLocale ?? existing?.localization?.fallbackLocale ?? "en",
        translations: input.localization?.translations ?? existing?.localization?.translations ?? {},
      },
      fallbackSection: input.fallbackSection ?? existing?.fallbackSection,
      conditionalRules: input.conditionalRules ?? existing?.conditionalRules,
      registeredAt: existing?.registeredAt ?? now,
      updatedAt: now,
    };

    this.sections.set(input.sectionKey, entry);
    this.rebuildOrderIndex();
    return entry;
  }

  unregister(sectionKey: string): boolean {
    const deleted = this.sections.delete(sectionKey);
    if (deleted) this.rebuildOrderIndex();
    return deleted;
  }

  get(sectionKey: string): SectionRegistryEntry | undefined {
    return this.sections.get(sectionKey);
  }

  getAll(): SectionRegistryEntry[] {
    return this.orderIndex
      .map((key) => this.sections.get(key))
      .filter((entry): entry is SectionRegistryEntry => entry !== undefined);
  }

  getVisible(): SectionRegistryEntry[] {
    return this.getAll().filter((entry) => entry.visible);
  }

  getByType(type: string): SectionRegistryEntry[] {
    return this.getAll().filter((entry) => entry.type === type);
  }

  getOrdered(): SectionRegistryEntry[] {
    return this.getAll().sort((a, b) => a.order - b.order);
  }

  getVisibleOrdered(): SectionRegistryEntry[] {
    return this.getOrdered().filter((entry) => entry.visible);
  }

  has(sectionKey: string): boolean {
    return this.sections.has(sectionKey);
  }

  count(): number {
    return this.sections.size;
  }

  updateOrder(sectionKey: string, newOrder: number): boolean {
    const entry = this.sections.get(sectionKey);
    if (!entry) return false;
    entry.order = newOrder;
    entry.updatedAt = new Date().toISOString();
    this.rebuildOrderIndex();
    return true;
  }

  reorder(orders: Array<{ sectionKey: string; order: number }>): void {
    for (const { sectionKey, order } of orders) {
      const entry = this.sections.get(sectionKey);
      if (entry) {
        entry.order = order;
        entry.updatedAt = new Date().toISOString();
      }
    }
    this.rebuildOrderIndex();
  }

  setVisibility(sectionKey: string, visible: boolean): boolean {
    const entry = this.sections.get(sectionKey);
    if (!entry) return false;
    entry.visible = visible;
    entry.updatedAt = new Date().toISOString();
    return true;
  }

  clear(): void {
    this.sections.clear();
    this.orderIndex = [];
  }

  resolveConditionalRules(
    sectionKey: string,
    context: {
      locale?: string;
      role?: string;
      permissions?: string[];
      featureFlags?: string[];
      device?: string;
    }
  ): boolean {
    const entry = this.sections.get(sectionKey);
    if (!entry || !entry.conditionalRules || entry.conditionalRules.length === 0) {
      return true;
    }

    for (const rule of entry.conditionalRules) {
      const matches = this.evaluateRule(rule, context);
      if (rule.negate ? matches : !matches) {
        return false;
      }
    }

    return true;
  }

  resolveFallback(sectionKey: string): SectionRegistryEntry | undefined {
    const entry = this.sections.get(sectionKey);
    if (!entry?.fallbackSection) return undefined;
    return this.sections.get(entry.fallbackSection);
  }

  toDefinitionList(): HomepageSectionDefinition[] {
    return this.getAll().map((entry) => ({
      id: entry.sectionKey,
      sectionKey: entry.sectionKey,
      type: entry.type,
      component: entry.component,
      title: entry.title,
      description: entry.description,
      order: entry.order,
      visible: entry.visible,
      locked: entry.locked,
      visibility: entry.visibility,
      config: entry.config,
      styles: entry.styles,
      media: [],
      permissions: entry.permissions,
      featureFlags: entry.featureFlags,
      localization: entry.localization,
      fallbackSection: entry.fallbackSection,
      conditionalRules: entry.conditionalRules,
    }));
  }

  private rebuildOrderIndex(): void {
    this.orderIndex = Array.from(this.sections.keys()).sort((a, b) => {
      const entryA = this.sections.get(a)!;
      const entryB = this.sections.get(b)!;
      return entryA.order - entryB.order;
    });
  }

  private evaluateRule(
    rule: SectionConditionalRule,
    context: {
      locale?: string;
      role?: string;
      permissions?: string[];
      featureFlags?: string[];
      device?: string;
    }
  ): boolean {
    switch (rule.type) {
      case "locale":
        return context.locale === rule.value;
      case "permission":
        return context.permissions?.includes(rule.value) ?? false;
      case "feature_flag":
        return context.featureFlags?.includes(rule.value) ?? false;
      case "device":
        return context.device === rule.value;
      default:
        return true;
    }
  }
}

let registryInstance: SectionRegistry | null = null;

export function getSectionRegistry(): SectionRegistry {
  if (!registryInstance) {
    registryInstance = new SectionRegistry();
  }
  return registryInstance;
}

export function resetSectionRegistry(): void {
  registryInstance = null;
}
