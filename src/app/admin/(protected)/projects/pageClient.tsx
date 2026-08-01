"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader, Plus, Edit, Trash2, BarChart3, Folder } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  usageCount: number;
  status: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  description: string;
  projectCount: number;
}

type TabKey = "templates" | "categories" | "analytics";

const TABS: { key: TabKey; icon: React.ReactNode }[] = [
  { key: "templates", icon: <Folder className="size-4" /> },
  { key: "categories", icon: <BarChart3 className="size-4" /> },
  { key: "analytics", icon: <BarChart3 className="size-4" /> },
];

export function AdminProjectsPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("templates");
  const [search, setSearch] = React.useState("");

  const { data: templatesData, isLoading: templatesLoading } = useSWR("/api/admin/project-templates", fetcher);
  const { data: categoriesData, isLoading: categoriesLoading } = useSWR("/api/admin/project-categories", fetcher);

  const templates = (templatesData?.data ?? []) as ProjectTemplate[];
  const categories = (categoriesData?.data ?? []) as ProjectCategory[];

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((tpl) => tpl.name.toLowerCase().includes(search.toLowerCase()));
  }, [templates, search]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const stats = React.useMemo(() => {
    const totalTemplates = templates.length;
    const totalCategories = categories.length;
    const totalProjects = categories.reduce((sum, cat) => sum + (cat.projectCount || 0), 0);
    return { totalTemplates, totalCategories, totalProjects };
  }, [templates, categories]);

  const renderTabContent = () => {
    if (activeTab === "templates") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filteredTemplates.length} {t("admin.templates", "Templates")}</p>
            <Button size="sm"><Plus className="mr-2 size-4" />{t("admin.templates", "Templates")}</Button>
          </div>
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <DashboardCard>
              <div className="flex flex-col items-center justify-center py-12">
                <Folder className="size-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">{t("projectStudio.noProjects", "No projects yet. Create your first project!")}</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <DashboardCard key={template.id}>
                  <div className="flex items-start justify-between mb-3">
                    <Badge tone="muted">{template.type}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-7"><Edit className="size-3" /></Button>
                      <Button variant="ghost" size="icon" className="size-7 text-destructive"><Trash2 className="size-3" /></Button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                  <div className="text-xs text-muted-foreground">{template.usageCount} uses</div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "categories") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{filteredCategories.length} {t("admin.coupons.label", "Categories")}</p>
            <Button size="sm"><Plus className="mr-2 size-4" />{t("admin.coupons.label", "Categories")}</Button>
          </div>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <DashboardCard>
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="size-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">{t("common.noData", "No data available")}</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{category.projectCount} projects</span>
                    <Button variant="ghost" size="icon" className="size-7"><Edit className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive"><Trash2 className="size-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "analytics") {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title={t("admin.total", "Total")}>
            <p className="text-2xl font-semibold">{stats.totalTemplates}</p>
            <p className="text-xs text-muted-foreground">{t("admin.templates", "Templates")}</p>
          </DashboardCard>
          <DashboardCard title={t("admin.coupons.label", "Categories")}>
            <p className="text-2xl font-semibold">{stats.totalCategories}</p>
            <p className="text-xs text-muted-foreground">{t("admin.coupons.label", "Categories")}</p>
          </DashboardCard>
          <DashboardCard title={t("projectStudio.totalProjects", "Projects")}>
            <p className="text-2xl font-semibold">{stats.totalProjects}</p>
            <p className="text-xs text-muted-foreground">{t("projectStudio.totalProjects", "Projects")}</p>
          </DashboardCard>
          <DashboardCard title={t("projectStudio.activeProjects", "Active")}>
            <p className="text-2xl font-semibold">{templates.filter((t) => t.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">{t("projectStudio.activeProjects", "Active")}</p>
          </DashboardCard>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("projectStudio.projects", "Projects") }]} />

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search", "Search") + "..."}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {t(`projectStudio.${tab.key}`, tab.key.charAt(0).toUpperCase() + tab.key.slice(1))}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}