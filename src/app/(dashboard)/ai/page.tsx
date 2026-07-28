import * as React from "react"
import { cookies } from "next/headers"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { AIPageClient } from "./AIPageClient"
import { AIPageActions } from "./AIPageActions"
import { getTranslation } from "@/lib/localization/translations"

export default async function AIPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  return (
    <AppShell>
      <PageLayout title={t("ai.pageTitle", "AI Platform")} description={t("ai.description", "Configure AI providers, models, and prompts.")} breadcrumb={[{ label: t("ai.pageTitle", "AI Platform") }]} actions={<AIPageActions />}>
        <AIPageClient />
      </PageLayout>
    </AppShell>
  );
}
