"use client";

import * as React from "react"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { Plug, Music, Play, Zap } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

const PROVIDERS = [
  { id: "1", name: "OpenAI", status: "Connected", models: 12, usage: "1,240 req/day", icon: "🔵" },
  { id: "2", name: "Anthropic", status: "Connected", models: 8, usage: "340 req/day", icon: "🟠" },
  { id: "3", name: "Google AI", status: "Disconnected", models: 15, usage: "—", icon: "🔴" },
  { id: "4", name: "OpenRouter", status: "Connected", models: 45, usage: "890 req/day", icon: "🟢" },
]

export function AIPageClient() {
  const { t } = useLocalizationContext();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("ai.providers", "Providers")} value={4} delta="3 connected" />
        <StatCard title={t("ai.modelsAvailable", "Models Available")} value={80} delta="+12 this month" />
        <StatCard title={t("ai.totalGenerations", "Total Generations")} value={1248} delta="+24 today" />
        <StatCard title={t("ai.creditsRemaining", "Credits Remaining")} value={8432} delta="$120.50 value" />
      </div>

      <DashboardCard title={t("ai.installedProviders", "Installed Providers")} description={t("ai.installedProvidersDesc", "Manage your AI provider connections")}>
        <div className="grid gap-4 sm:grid-cols-2">
          {PROVIDERS.map((provider) => (
            <div key={provider.id} className="rounded-xl border border-border bg-muted/20 p-5 transition hover:border-foreground/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{provider.icon}</div>
                  <div>
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-xs text-muted-foreground">{provider.models} models available</p>
                  </div>
                </div>
                <Badge tone={provider.status === "Connected" ? "success" : "muted"}>
                  {provider.status}
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage: {provider.usage}</span>
                <div className="flex gap-2">
                  <Link href={`/ai/providers/${provider.id}`} className="text-sm text-primary hover:underline">{t("ai.configure", "Configure")}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title={t("ai.usageOverview", "Usage Overview")} description={t("ai.usageOverviewDesc", "Generation volume by provider")}>
          <div className="space-y-3">
            {PROVIDERS.filter(p => p.status === "Connected").map((provider) => (
              <div key={provider.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{provider.icon}</span>
                  <span className="text-sm">{provider.name}</span>
                </div>
                <span className="text-sm font-medium">{provider.usage}</span>
              </div>
            ))}
          </div>
          <Link href="/ai" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">{t("ai.viewDetailedAnalytics", "View detailed analytics")}</Link>
        </DashboardCard>

        <DashboardCard title={t("ai.quickActions", "Quick Actions")} description={t("ai.quickActionsDesc", "Common AI tasks")}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Generate Image", icon: Zap },
              { label: "Generate Video", icon: Play },
              { label: "Generate Audio", icon: Music },
              { label: "Manage Providers", icon: Plug },
            ].map((action) => (
              <div
                key={action.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/20 p-4 text-center transition hover:border-foreground/10"
              >
                <action.icon className="size-5 text-muted-foreground" />
                <span className="text-xs font-medium">{t("ai.generateImage", action.label)}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
