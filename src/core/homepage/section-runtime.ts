import type {
  HomepageSectionDefinition,
  HomepageContext,
  HomepageMediaItem,
  SectionRegistrationInput,
} from "./homepage.types";
import { getSectionRegistry, type SectionRegistry } from "./section-registry";

export interface SectionRenderData {
  section: HomepageSectionDefinition;
  resolvedTitle: string;
  resolvedDescription: string;
  resolvedConfig: Record<string, unknown>;
  resolvedMedia: HomepageMediaItem[];
  isVisible: boolean;
  sectionId: string;
  ariaLabelledBy: string;
}

export interface SectionComponentRegistry {
  [key: string]: React.ComponentType<{ section: SectionRenderData }>;
}

export class SectionRuntime {
  private sectionRegistry: SectionRegistry;
  private componentRegistry: SectionComponentRegistry = {};

  constructor(sectionRegistry?: SectionRegistry) {
    this.sectionRegistry = sectionRegistry ?? getSectionRegistry();
  }

  resolveSection(
    section: HomepageSectionDefinition,
    context: HomepageContext
  ): SectionRenderData {
    const resolvedTitle = this.resolveLocalizedValue(
      section.title,
      section.localization.translations,
      context.locale,
      section.localization.fallbackLocale
    );

    const resolvedDescription = this.resolveLocalizedValue(
      section.description ?? "",
      section.localization.translations,
      context.locale,
      section.localization.fallbackLocale
    );

    const resolvedConfig = this.resolveConfig(
      section.config,
      section.localization.translations,
      context.locale,
      section.localization.fallbackLocale
    );

    const resolvedMedia = this.resolveMedia(section.media, context);

    return {
      section,
      resolvedTitle,
      resolvedDescription,
      resolvedConfig,
      resolvedMedia,
      isVisible: section.visible,
      sectionId: `section-${section.sectionKey}`,
      ariaLabelledBy: `${section.sectionKey}-heading`,
    };
  }

  resolveSections(
    sections: HomepageSectionDefinition[],
    context: HomepageContext
  ): SectionRenderData[] {
    return sections
      .filter((section) => section.visible)
      .map((section) => this.resolveSection(section, context));
  }

  registerComponent(sectionKey: string, component: React.ComponentType<{ section: SectionRenderData }>): void {
    this.componentRegistry[sectionKey] = component;
  }

  getComponent(sectionKey: string): React.ComponentType<{ section: SectionRenderData }> | undefined {
    return this.componentRegistry[sectionKey];
  }

  hasComponent(sectionKey: string): boolean {
    return sectionKey in this.componentRegistry;
  }

  getRegisteredComponents(): string[] {
    return Object.keys(this.componentRegistry);
  }

  registerSections(inputs: SectionRegistrationInput[]): void {
    for (const input of inputs) {
      this.sectionRegistry.register(input);
    }
  }

  getAvailableSectionTypes(): string[] {
    return [
      "hero",
      "features",
      "ai-platform",
      "screenshots",
      "realtime-stats",
      "pricing",
      "credit-packs",
      "credit-calculator",
      "credit-usage",
      "testimonials",
      "faq",
      "cta",
      "footer",
      "social-proof",
    ];
  }

  getSectionType(componentKey: string): string | undefined {
    const entry = this.sectionRegistry.get(componentKey);
    return entry?.type;
  }

  private resolveLocalizedValue(
    value: string,
    translations: Record<string, Record<string, string>>,
    locale: string,
    fallbackLocale: string
  ): string {
    if (!value) return value;

    if (translations[locale]?.[value]) {
      return translations[locale][value];
    }

    if (translations[fallbackLocale]?.[value]) {
      return translations[fallbackLocale][value];
    }

    return value;
  }

  private resolveConfig(
    config: Record<string, unknown>,
    translations: Record<string, Record<string, string>>,
    locale: string,
    fallbackLocale: string
  ): Record<string, unknown> {
    const result = { ...config };

    for (const [key, value] of Object.entries(result)) {
      if (typeof value === "string") {
        result[key] = this.resolveLocalizedValue(value, translations, locale, fallbackLocale);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = this.resolveConfig(
          value as Record<string, unknown>,
          translations,
          locale,
          fallbackLocale
        );
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) => {
          if (typeof item === "string") {
            return this.resolveLocalizedValue(item, translations, locale, fallbackLocale);
          }
          if (typeof item === "object" && item !== null) {
            return this.resolveConfig(
              item as Record<string, unknown>,
              translations,
              locale,
              fallbackLocale
            );
          }
          return item;
        });
      }
    }

    return result;
  }

  private resolveMedia(
    media: HomepageMediaItem[],
    context: HomepageContext
  ): HomepageMediaItem[] {
    return media.map((item) => ({
      ...item,
      url: this.getResponsiveUrl(item, context.device),
    }));
  }

  private getResponsiveUrl(
    media: HomepageMediaItem,
    device: string
  ): string {
    if (!media.responsive) return media.url;

    switch (device) {
      case "mobile":
        return media.responsive.sm || media.url;
      case "tablet":
        return media.responsive.md || media.responsive.sm || media.url;
      default:
        return media.responsive.lg || media.responsive.xl || media.url;
    }
  }
}

let sectionRuntimeInstance: SectionRuntime | null = null;

export function getSectionRuntime(): SectionRuntime {
  if (!sectionRuntimeInstance) {
    sectionRuntimeInstance = new SectionRuntime();
  }
  return sectionRuntimeInstance;
}

export function resetSectionRuntime(): void {
  sectionRuntimeInstance = null;
}
