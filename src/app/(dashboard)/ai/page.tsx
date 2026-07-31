import * as React from "react"
import { cookies } from "next/headers"
import { AIPageClient } from "./AIPageClient"
import { AIPageActions } from "./AIPageActions"
import { getTranslation } from "@/lib/localization/translations"

export default async function AIPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("ai.pageTitle", "AI Platform")}</h2>
          <p className="text-sm text-muted-foreground">{t("ai.description", "Configure AI providers, models, and prompts.")}</p>
        </div>
        <AIPageActions />
      </div>
      <AIPageClient />
    </div>
  );
}
