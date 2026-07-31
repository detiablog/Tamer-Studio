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
import { Palette, FileText, BarChart3, Settings, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AIImageAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"styles" | "templates" | "analytics" | "settings">("styles");

  const { data: stylesData, isLoading: loadingStyles } = useSWR("/api/image-studio/styles", fetcher);
  const styles = stylesData?.data || [];

  const { data: templatesData, isLoading: loadingTemplates } = useSWR("/api/image-studio/templates", fetcher);
  const templates = templatesData?.data || [];

  const { data: statsData } = useSWR("/api/image-studio/stats?all=true", fetcher);
  const stats = statsData?.data || {};

  const tabs = [
    { key: "styles" as const, label: t("imageStudio.styles"), icon: Palette },
    { key: "templates" as const, label: t("imageStudio.templates"), icon: FileText },
    { key: "analytics" as const, label: t("admin.analytics"), icon: BarChart3 },
    { key: "settings" as const, label: t("admin.settings"), icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.dashboard") }, { label: t("admin.aiImage") }]} />
      <PageHeader title={t("admin.aiImage")} description={t("admin.aiImageDescription")} />

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <tab.icon className="size-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "styles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("imageStudio.styleLibrary", "Style Library")}</h3>
            <Button>{t("imageStudio.addStyle", "Add Style")}</Button>
          </div>
          {loadingStyles ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map((style: { id: string; name: string; category?: string; isActive?: boolean; isSystem?: boolean; usageCount?: number }) => (
                <DashboardCard key={style.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{style.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{style.category}</p>
                      <p className="text-xs text-muted-foreground">Usage: {style.usageCount || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      {style.isSystem && <Badge variant="outline">System</Badge>}
                      <Badge variant={style.isActive ? "default" : "secondary"}>{style.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("imageStudio.templates")}</h3>
            <Button>{t("imageStudio.addTemplate", "Add Template")}</Button>
          </div>
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tpl: { id: string; name: string; category?: string; isSystem?: boolean; usageCount?: number; promptTemplate?: string }) => (
                <DashboardCard key={tpl.id}>
                  <h4 className="font-medium">{tpl.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{tpl.category}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{tpl.promptTemplate}</p>
                  <div className="flex gap-2 mt-3">
                    {tpl.isSystem && <Badge variant="outline">System</Badge>}
                    <Badge variant="secondary">Usage: {tpl.usageCount || 0}</Badge>
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
              { label: "Total Generations", value: stats.totalGenerations || 0 },
              { label: "Completed", value: stats.completedGenerations || 0 },
              { label: "Styles", value: styles.length },
              { label: "Templates", value: templates.length },
            ].map((card) => (
              <DashboardCard key={card.label}>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </DashboardCard>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <DashboardCard>
          <h3 className="font-heading font-semibold mb-4">{t("admin.settings")}</h3>
          <p className="text-sm text-muted-foreground">{t("imageStudio.adminSettingsDesc", "Configure default generation settings, limits, and moderation rules.")}</p>
        </DashboardCard>
      )}
    </div>
  );
}
