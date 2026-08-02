"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import { LayoutGrid, Wand2, Film, BarChart3, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AIVideoAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"templates" | "effects" | "transitions" | "analytics">("templates");

  const { data: templatesData, isLoading: loadingTemplates } = useSWR("/api/video-studio/templates", fetcher);
  const templates = templatesData?.data || [];

  const { data: effectsData, isLoading: loadingEffects } = useSWR("/api/video-studio/effects", fetcher);
  const effects = effectsData?.data || [];

  const { data: transitionsData, isLoading: loadingTransitions } = useSWR("/api/video-studio/transitions", fetcher);
  const transitions = transitionsData?.data || [];

  const { data: statsData } = useSWR("/api/video-studio/stats?all=true", fetcher);
  const stats = statsData?.data || {};

  const tabs = [
    { key: "templates" as const, label: t("videoStudio.templates"), icon: LayoutGrid },
    { key: "effects" as const, label: t("videoStudio.effects"), icon: Wand2 },
    { key: "transitions" as const, label: t("videoStudio.transitions"), icon: Film },
    { key: "analytics" as const, label: t("admin.analytics"), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.dashboard") }, { label: t("admin.aiVideo") }]} />
      <PageHeader title={t("admin.aiVideo")} description={t("admin.aiVideoDescription")} />

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <tab.icon className="size-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("videoStudio.templates")}</h3>
            <Button>{t("videoStudio.createProject")}</Button>
          </div>
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl: { id: string; name: string; category?: string; isSystem?: boolean; usageCount?: number }) => (
                <DashboardCard key={tpl.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{tpl.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tpl.category}</p>
                      <p className="text-xs text-muted-foreground">Usage: {tpl.usageCount || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      {tpl.isSystem && <Badge tone="default">System</Badge>}
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "effects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("videoStudio.effects")}</h3>
            <Button>{t("videoStudio.createProject")}</Button>
          </div>
          {loadingEffects ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {effects.map((fx: { id: string; name: string; category?: string; isActive?: boolean }) => (
                <DashboardCard key={fx.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{fx.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{fx.category}</p>
                    </div>
                    <Badge tone={fx.isActive ? "default" : "muted"}>{fx.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "transitions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("videoStudio.transitions")}</h3>
            <Button>{t("videoStudio.createProject")}</Button>
          </div>
          {loadingTransitions ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {transitions.map((tr: { id: string; name: string; category?: string; isActive?: boolean }) => (
                <DashboardCard key={tr.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{tr.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{tr.category}</p>
                    </div>
                    <Badge tone={tr.isActive ? "default" : "muted"}>{tr.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t("videoStudio.totalVideos"), value: stats.totalVideos || 0 },
              { label: t("videoStudio.totalProjects"), value: stats.totalProjects || 0 },
              { label: t("videoStudio.templates"), value: templates.length },
              { label: t("videoStudio.effects"), value: effects.length },
            ].map((card) => (
              <DashboardCard key={card.label}>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </DashboardCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
