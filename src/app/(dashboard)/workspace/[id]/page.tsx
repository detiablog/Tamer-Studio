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
    route: `/workspace/${id}`,
    title: t("workspace.metadataTitle", "Workspace") + ` — ${id}`,
    description: t("workspace.metadataDescription", "Workspace details for {id} on Tamer Studio.").replace("{id}", id),
    type: "website",
  });
}

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  return (
    <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
      {t("workspace.detailComingSoon", "Workspace detail coming soon.")}
    </div>
  );
}
