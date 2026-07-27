export interface LocalizedCMSContent {
  id: string;
  type: string;
  translations: Record<string, { title?: string; description?: string; body?: string; metadata?: Record<string, unknown> }>;
  fallbackLocale: string;
  translationStatus: "complete" | "partial" | "missing";
  publishState: "draft" | "published" | "archived";
  updatedAt: string;
}

export interface LocalizedCMSField {
  fieldKey: string;
  requiredLocales: string[];
  fallbackLocale: string;
}

export function createLocalizedContent(base: Partial<LocalizedCMSContent>): LocalizedCMSContent {
  return {
    id: base.id ?? crypto.randomUUID(),
    type: base.type ?? "unknown",
    translations: base.translations ?? {},
    fallbackLocale: base.fallbackLocale ?? "en",
    translationStatus: base.translationStatus ?? "missing",
    publishState: base.publishState ?? "draft",
    updatedAt: new Date().toISOString(),
  };
}

export function getLocalizedValue(
  content: LocalizedCMSContent,
  fieldKey: string,
  locale: string
): string | undefined {
  const translation = content.translations[locale];
  if (translation) {
    const value = translation[fieldKey as keyof typeof translation];
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  const fallback = content.translations[content.fallbackLocale];
  if (fallback) {
    const value = fallback[fieldKey as keyof typeof fallback];
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return undefined;
}