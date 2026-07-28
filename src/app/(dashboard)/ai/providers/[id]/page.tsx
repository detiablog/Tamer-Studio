import * as React from "react";
import { cookies } from "next/headers";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AIProviderDetail } from "@/features/ai/AIProviderDetail";
import { generatePageMetadata } from "@/core/seo";
import { getTranslation } from "@/lib/localization/translations";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  return generatePageMetadata({
    route: `/ai/providers/${id}`,
    title: `${t("ai.providerMetadataTitle", "AI Provider")} — ${id}`,
    description: t("ai.providerMetadataDescription", "AI provider configuration for {id} on Tamer Studio.").replace("{id}", id),
    type: "website",
  });
}

export default async function AIProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  return (
    <AppShell>
        <PageLayout title={t("ai.providerTitle", "AI Provider")} breadcrumb={[{ label: t("marketing.aiPlatform", "AI Platform"), href: "/ai" }, { label: id }]}>
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            {t("ai.providerComingSoon", "Provider detail coming soon.")}
          </div>
        </PageLayout>
    </AppShell>
  );
}
