import type { HomepageSectionDefinition, HomepageContext, HomepageResolutionResult } from "./homepage.types";
import { getSectionRegistry, type SectionRegistry } from "./section-registry";

export interface CompositionResult {
  sections: HomepageSectionDefinition[];
  metadata: {
    totalSections: number;
    visibleSections: number;
    hiddenSections: number;
    resolvedAt: string;
    locale: string;
    device: string;
  };
}

export interface FallbackStrategy {
  type: "default_content" | "hide" | "use_fallback" | "use_registry";
  fallbackSectionKey?: string;
}

const DEFAULT_FALLBACK_STRATEGY: FallbackStrategy = {
  type: "use_registry",
};

export class HomepageComposition {
  private sectionRegistry: SectionRegistry;
  private fallbackStrategy: FallbackStrategy;

  constructor(sectionRegistry?: SectionRegistry, fallbackStrategy?: FallbackStrategy) {
    this.sectionRegistry = sectionRegistry ?? getSectionRegistry();
    this.fallbackStrategy = fallbackStrategy ?? DEFAULT_FALLBACK_STRATEGY;
  }

  compose(
    sections: HomepageSectionDefinition[],
    context: HomepageContext
  ): CompositionResult {
    const processed = this.processSections(sections, context);
    const ordered = this.orderSections(processed);
    const withFallbacks = this.applyFallbacks(ordered);

    const visible = withFallbacks.filter((s) => s.visible);
    const hidden = withFallbacks.filter((s) => !s.visible);

    return {
      sections: withFallbacks,
      metadata: {
        totalSections: withFallbacks.length,
        visibleSections: visible.length,
        hiddenSections: hidden.length,
        resolvedAt: new Date().toISOString(),
        locale: context.locale,
        device: context.device,
      },
    };
  }

  composeFromResolution(resolution: HomepageResolutionResult): CompositionResult {
    return this.compose(resolution.sections, resolution.context);
  }

  private processSections(
    sections: HomepageSectionDefinition[],
    context: HomepageContext
  ): HomepageSectionDefinition[] {
    return sections
      .filter((section) => this.evaluateSection(section, context))
      .map((section) => this.localizeSection(section, context));
  }

  private orderSections(sections: HomepageSectionDefinition[]): HomepageSectionDefinition[] {
    return [...sections].sort((a, b) => a.order - b.order);
  }

  private applyFallbacks(sections: HomepageSectionDefinition[]): HomepageSectionDefinition[] {
    const registrySections = this.sectionRegistry.getVisibleOrdered();
    const sectionKeys = new Set(sections.map((s) => s.sectionKey));

    for (const registrySection of registrySections) {
      if (!sectionKeys.has(registrySection.sectionKey)) {
        const definition = this.sectionRegistryToDefinition(registrySection);
        if (this.fallbackStrategy.type === "use_registry") {
          sections.push(definition);
        }
      }
    }

    return this.orderSections(sections);
  }

  private evaluateSection(
    section: HomepageSectionDefinition,
    context: HomepageContext
  ): boolean {
    if (!section.visible) return false;

    if (section.visibility === "admin" && context.role !== "admin") return false;
    if (section.visibility === "authenticated" && !context.role) return false;

    if (section.permissions.length > 0) {
      const hasPermission = section.permissions.some((p) => context.permissions.includes(p));
      if (!hasPermission) return false;
    }

    if (section.featureFlags.length > 0) {
      const hasFlag = section.featureFlags.every((f) => context.featureFlags.includes(f));
      if (!hasFlag) return false;
    }

    if (section.conditionalRules && section.conditionalRules.length > 0) {
      const passesRules = this.sectionRegistry.resolveConditionalRules(section.sectionKey, {
        locale: context.locale,
        role: context.role ?? undefined,
        permissions: context.permissions,
        featureFlags: context.featureFlags,
        device: context.device,
      });
      if (!passesRules) return false;
    }

    return true;
  }

  private localizeSection(
    section: HomepageSectionDefinition,
    context: HomepageContext
  ): HomepageSectionDefinition {
    const { locale } = context;
    const { translations, fallbackLocale } = section.localization;

    if (translations[locale]) {
      const localeTranslations = translations[locale];
      return {
        ...section,
        title: localeTranslations.title || section.title,
        description: localeTranslations.description || section.description,
        config: this.localizeConfig(section.config, localeTranslations),
      };
    }

    if (fallbackLocale && translations[fallbackLocale]) {
      const fallbackTranslations = translations[fallbackLocale];
      return {
        ...section,
        title: fallbackTranslations.title || section.title,
        description: fallbackTranslations.description || section.description,
        config: this.localizeConfig(section.config, fallbackTranslations),
      };
    }

    return section;
  }

  private localizeConfig(
    config: Record<string, unknown>,
    translations: Record<string, string>
  ): Record<string, unknown> {
    const result = { ...config };

    for (const [key, value] of Object.entries(result)) {
      if (typeof value === "string" && translations[key]) {
        result[key] = translations[key];
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = this.localizeConfig(value as Record<string, unknown>, translations);
      }
    }

    return result;
  }

  private sectionRegistryToDefinition(
    entry: ReturnType<SectionRegistry["get"]> & object
  ): HomepageSectionDefinition {
    return {
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
    };
  }

  setFallbackStrategy(strategy: FallbackStrategy): void {
    this.fallbackStrategy = strategy;
  }

  getFallbackStrategy(): FallbackStrategy {
    return { ...this.fallbackStrategy };
  }
}

let compositionInstance: HomepageComposition | null = null;

export function getHomepageComposition(): HomepageComposition {
  if (!compositionInstance) {
    compositionInstance = new HomepageComposition();
  }
  return compositionInstance;
}

export function resetHomepageComposition(): void {
  compositionInstance = null;
}
