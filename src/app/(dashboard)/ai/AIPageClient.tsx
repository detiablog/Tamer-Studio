"use client";

import * as React from "react"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { Plug, Music, Play, Zap } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

interface ProviderData {
  name: string;
  displayName: string;
  enabled: boolean;
  models: string[];
}

interface AIProvidersResponse {
  providers: ProviderData[];
  models: Array<{ provider: string; model: string }>;
  summary: {
    totalProviders: number;
    connectedProviders: number;
    totalModels: number;
  };
}

const ICONS: Record<string, string> = {
  openai: "\uD83D\uDD35",
  anthropic: "\uD83D\uDFE0",
  google: "\uD83D\uDD34",
};

export function AIPageClient() {
  const { t } = useLocalizationContext();
  const [data, setData] = React.useState<AIProvidersResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/ai-providers")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const providers = data?.providers ?? [];
  const summary = data?.summary ?? { totalProviders: 0, connectedProviders: 0, totalModels: 0 };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("ai.providers", "Providers")} value={summary.totalProviders} delta={`${summary.connectedProviders} connected`} />
        <StatCard title={t("ai.modelsAvailable", "Models Available")} value={summary.totalModels} delta="" />
        <StatCard title={t("ai.totalGenerations", "Total Generations")} value={0} delta="—" />
        <StatCard title={t("ai.creditsRemaining", "Credits Remaining")} value={0} delta="—" />
      </div>

      <DashboardCard title={t("ai.installedProviders", "Installed Providers")} description={t("ai.installedProvidersDesc", "Manage your AI provider connections")}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((provider) => (
              <div key={provider.name} className="rounded-xl border border-border bg-muted/20 p-5 transition hover:border-foreground/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{ICONS[provider.name] ?? "\u2728"}</div>
                    <div>
                      <h4 className="font-medium">{provider.displayName}</h4>
                      <p className="text-xs text-muted-foreground">{provider.models.length} models available</p>
                    </div>
                  </div>
                  <Badge tone={provider.enabled ? "success" : "muted"}>
                    {provider.enabled ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {provider.enabled ? provider.models.slice(0, 3).join(", ") + (provider.models.length > 3 ? ` +${provider.models.length - 3} more` : "") : "API key not configured"}
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/ai/providers/${provider.name}`} className="text-sm text-primary hover:underline">{t("ai.configure", "Configure")}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title={t("ai.usageOverview", "Usage Overview")} description={t("ai.usageOverviewDesc", "Generation volume by provider")}>
          <div className="space-y-3">
            {providers.filter((p) => p.enabled).map((provider) => (
              <div key={provider.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{ICONS[provider.name] ?? "\u2728"}</span>
                  <span className="text-sm">{provider.displayName}</span>
                </div>
                <span className="text-sm font-medium">{provider.models.length} models</span>
              </div>
            ))}
            {providers.filter((p) => p.enabled).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No providers connected. Add an API key to get started.</p>
            )}
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
