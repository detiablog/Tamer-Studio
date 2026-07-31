import * as React from "react";
import { cookies } from "next/headers";
import { generatePageMetadata } from "@/core/seo";
import { getTranslation } from "@/lib/localization/translations";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  return generatePageMetadata({
    route: `/projects/${id}`,
    title: `${t("projects.pageTitle", "Projects")} — ${id}`,
    description: t("projects.metadataDescription", "Create and manage production projects, assets, and schedules."),
    type: "website",
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  return (
    <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      {t("projects.detailComingSoon", "Project detail coming soon.")}
    </div>
  );
}
