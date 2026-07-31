"use client";

import { useHomepage } from "@/hooks/use-homepage";
import { renderLandingSection } from "@/lib/landing-section-renderer";
import { Header } from "@/components/landing/Header";
import { ElegantLoader } from "@/components/ui/ElegantLoader";
import { useLocalizationContext } from "@/providers/localization";
import type { HomepageSectionDefinition } from "@/core/homepage";

export function HomepageRuntimeContent() {
  const { t } = useLocalizationContext();
  const { locale } = useLocalizationContext();
  const { sections, loading, error, resolvedAt } = useHomepage({ locale });

  if (loading) {
    return <ElegantLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-lg font-semibold text-destructive">
              {t("landing.loadingError.title", "Unable to load homepage")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("landing.loadingError.description", "Please check your connection and try again later.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {sections.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">
                {t("landing.noSections.title", "No sections published yet")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("landing.noSections.description", "Check back soon for updates.")}
              </p>
            </div>
          </div>
        ) : (
          sections
            .filter((s) => s.visible)
            .map((section) => (
              <HomepageSectionRenderer key={section.sectionKey} section={section} />
            ))
        )}
      </main>
    </div>
  );
}

function HomepageSectionRenderer({ section }: { section: HomepageSectionDefinition }) {
  const landingSection = {
    id: section.id,
    sectionKey: section.sectionKey,
    title: section.title,
    description: section.description ?? null,
    config: section.config,
    media: section.media?.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type,
      order: m.order,
    })),
  };

  return <>{renderLandingSection(landingSection as any)}</>;
}
