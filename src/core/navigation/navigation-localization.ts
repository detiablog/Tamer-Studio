import type { NavigationItem, NavigationMenu } from "./navigation.types";
import { TranslationRuntime } from "@/lib/localization/translation-runtime";
import type { SupportedLocale } from "@/lib/localization/types";

export class NavigationLocalizationIntegration {
  private translationRuntime: TranslationRuntime;
  private namespace: string = "navigation";
  private fallbackLocale: SupportedLocale = "en";

  constructor(options?: { namespace?: string; fallbackLocale?: SupportedLocale }) {
    this.namespace = options?.namespace ?? "navigation";
    this.fallbackLocale = options?.fallbackLocale ?? "en";
    this.translationRuntime = new TranslationRuntime({
      locale: "en" as SupportedLocale,
      fallbackLocale: this.fallbackLocale,
      namespace: this.namespace,
    });
  }

  translateNavigationItem(item: NavigationItem, locale: string): NavigationItem {
    const translated = { ...item };
    if (item.titleKey) {
      translated.title = this.translateKey(item.titleKey, locale, item.title);
    }
    if (item.descriptionKey) {
      translated.description = this.translateKey(
        item.descriptionKey,
        locale,
        item.description ?? ""
      );
    }
    if (item.badgeKey) {
      translated.badge = this.translateKey(item.badgeKey, locale, item.badge ?? "");
    }
    if (item.localization?.translations) {
      const localeTranslations = item.localization.translations;
      if (localeTranslations[locale]) {
        translated.title = localeTranslations[locale];
      } else if (localeTranslations[this.fallbackLocale]) {
        translated.title = localeTranslations[this.fallbackLocale];
      }
    }
    return translated;
  }

  translateBreadcrumbItem(
    item: { label: string; labelKey?: string; href: string; current: boolean; order: number },
    locale: string
  ) {
    const translated = { ...item };
    if (item.labelKey) {
      translated.label = this.translateKey(item.labelKey, locale, item.label);
    }
    return translated;
  }

  translateMenu(menu: NavigationMenu, locale: string): NavigationMenu {
    const translated = { ...menu };
    if (menu.nameKey) {
      translated.name = this.translateKey(menu.nameKey, locale, menu.name);
    }
    translated.items = menu.items.map((item) =>
      this.translateNavigationItem(item, locale)
    );
    translated.groups = menu.groups.map((group) => ({
      ...group,
      name: group.nameKey
        ? this.translateKey(group.nameKey, locale, group.name)
        : group.name,
      items: group.items.map((item) =>
        this.translateNavigationItem(item, locale)
      ),
    }));
    return translated;
  }

  translateItems(items: NavigationItem[], locale: string): NavigationItem[] {
    return items.map((item) => this.translateNavigationItem(item, locale));
  }

  setLocale(locale: string): void {
    this.translationRuntime = new TranslationRuntime({
      locale: locale as SupportedLocale,
      fallbackLocale: this.fallbackLocale,
      namespace: this.namespace,
    });
  }

  getLocale(): string {
    return this.translationRuntime.getLocale();
  }

  setFallbackLocale(locale: string): void {
    this.fallbackLocale = locale as SupportedLocale;
    this.translationRuntime = new TranslationRuntime({
      locale: this.translationRuntime.getLocale(),
      fallbackLocale: this.fallbackLocale,
      namespace: this.namespace,
    });
  }

  getFallbackLocale(): string {
    return this.fallbackLocale;
  }

  setNamespace(namespace: string): void {
    this.namespace = namespace;
    this.translationRuntime = new TranslationRuntime({
      locale: this.translationRuntime.getLocale(),
      fallbackLocale: this.fallbackLocale,
      namespace: namespace,
    });
  }

  getNamespace(): string {
    return this.namespace;
  }

  hasTranslation(key: string, locale?: string): boolean {
    const targetLocale = locale ?? this.translationRuntime.getLocale();
    return this.translationRuntime.has(key);
  }

  private translateKey(key: string, locale: string, fallback: string): string {
    const runtime = new TranslationRuntime({
      locale: locale as SupportedLocale,
      fallbackLocale: this.fallbackLocale,
      namespace: this.namespace,
    });
    return runtime.t(key, fallback);
  }
}

let navigationLocalizationInstance: NavigationLocalizationIntegration | null = null;

export function getNavigationLocalization(): NavigationLocalizationIntegration {
  if (!navigationLocalizationInstance) {
    navigationLocalizationInstance = new NavigationLocalizationIntegration();
  }
  return navigationLocalizationInstance;
}

export function resetNavigationLocalization(): void {
  navigationLocalizationInstance = null;
}