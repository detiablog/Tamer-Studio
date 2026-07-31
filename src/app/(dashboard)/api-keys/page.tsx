"use client";

import * as React from "react"
import useSWR from "swr"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Key, Copy, Trash2, Shield, Clock } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  status: string;
  usageCount: string;
}

function timeAgo(dateStr: string | null, t: (key: string, fallback?: string) => string): string {
  if (!dateStr) return t("common.never");
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return t("time.justNow");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}${t("time.minutesAgo")}`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}${t("time.hoursAgo")}`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}${t("time.daysAgo")}`;
  return date.toLocaleDateString();
}

export default function ApiKeysPage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading, mutate } = useSWR("/api/api-keys", fetcher);
  const [creating, setCreating] = React.useState(false);

  const keys: ApiKeyItem[] = data?.data ?? [];
  const activeCount = keys.filter((k: ApiKeyItem) => k.status === "Active").length;
  const inactiveCount = keys.filter((k: ApiKeyItem) => k.status !== "Active").length;

  const lastRotation = React.useMemo(() => {
    if (keys.length === 0) return null;
    const sorted = [...keys].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    return timeAgo(sorted[0].created, t);
  }, [keys, t]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Key ${keys.length + 1}` }),
      });
      mutate();
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("apiKeys.activeKeys", "Active Keys")} value={activeCount} delta={inactiveCount > 0 ? t("apiKeys.delta1Inactive", `${inactiveCount} inactive`) : t("apiKeys.noInactiveKeys", "All active")} />
        <StatCard title={t("apiKeys.totalRequests", "Total Requests")} value="N/A" delta={t("apiKeys.deltaPlus120Today", "+120 today")} />
        <StatCard title={t("apiKeys.lastRotation", "Last Rotation")} value={lastRotation ?? t("apiKeys.deltaNoKeys", "No keys")} delta={t("apiKeys.deltaRecommended90Days", "Recommended: 90 days")} />
        <StatCard title={t("apiKeys.securityScore", "Security Score")} value="N/A" delta={t("apiKeys.scoreNoExposedKeys", "No exposed keys")} />
      </div>

      <DashboardCard title={t("apiKeys.yourKeys", "Your API Keys")} description={t("apiKeys.yourKeysDesc", "Manage keys for external integrations")}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8 text-sm text-destructive">
            {t("common.failedToLoad", "Failed to load data")}
          </div>
        ) : (
          <div className="space-y-3">
            {keys.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">{t("apiKeys.empty")}</p>
            )}
            {keys.map((apiKey: ApiKeyItem) => (
              <div key={apiKey.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                    <Key className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge tone={apiKey.status === "Active" ? "success" : "muted"}>
                        {apiKey.status === "Active" ? t("apiKeys.statusActive", "Active") : t("apiKeys.statusInactive", "Inactive")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{apiKey.key}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {t("apiKeys.createdAgo", "Created {0}").replace("{0}", new Date(apiKey.created).toLocaleDateString())}
                      </span>
                      <span>{t("apiKeys.lastUsedAgo", "Last used {0}").replace("{0}", timeAgo(apiKey.lastUsed, t))}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8">
                    <Copy className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Shield className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => handleRevoke(apiKey.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title={t("apiKeys.securityBestPractices", "Security Best Practices")}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: t("apiKeys.rotateKeys", "Rotate Keys Regularly"), description: t("apiKeys.rotateKeysDesc", "Rotate your API keys every 90 days for optimal security.") },
            { title: t("apiKeys.useEnvVars", "Use Environment Variables"), description: t("apiKeys.useEnvVarsDesc", "Never hardcode keys. Use env vars or secret managers.") },
            { title: t("apiKeys.monitorUsage", "Monitor Usage"), description: t("apiKeys.monitorUsageDesc", "Set up alerts for unusual API activity.") },
          ].map((practice) => (
            <div key={practice.title} className="rounded-xl border border-border bg-muted/20 p-4">
              <h4 className="font-medium text-sm">{practice.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{practice.description}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  )
}
