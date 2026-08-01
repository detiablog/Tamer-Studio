"use client";

import * as React from "react";
import useSWR from "swr";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Megaphone,
  Package,
  BarChart3,
  Plus,
  Search,
  Trash2,
  Pencil,
  Loader2,
  ExternalLink,
  AlertTriangle,
  FileText,
  Image,
  Users,
  TrendingUp,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type Tab = "templates" | "products" | "analytics";

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  active: "success",
  draft: "muted",
  completed: "info",
  paused: "warning",
  failed: "destructive",
};

export function AdminAffiliateStudioPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("templates");
  const [search, setSearch] = React.useState("");

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR("/api/admin/affiliate-studio/templates", fetcher);
  const { data: productsData, isLoading: productsLoading, mutate: mutateProducts } = useSWR("/api/admin/affiliate-studio/products", fetcher);
  const { data: analyticsData, isLoading: analyticsLoading } = useSWR("/api/admin/affiliate-studio/analytics", fetcher);

  const templates = templatesData?.data ?? [];
  const products = productsData?.data ?? [];
  const analytics = analyticsData?.data ?? {};

  const tabs = [
    { id: "templates" as Tab, label: "Templates", icon: FileText },
    { id: "products" as Tab, label: t("affiliateStudio.products"), icon: Package },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
  ];

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/affiliate-studio/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateTemplates();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const renderTemplates = () => (
    <DashboardCard title="Campaign Templates">
      {templatesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No templates yet</p>
          <Button className="mt-4" size="sm"><Plus className="mr-2 size-4" />Create Template</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template: any) => (
            <div key={template.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.type}</p>
                </div>
                <Badge tone={(CAMPAIGN_STATUS_COLORS[template.status] as any) || "muted"}>{template.status || "active"}</Badge>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm"><Pencil className="size-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderProducts = () => (
    <DashboardCard title={t("affiliateStudio.products")}>
      {productsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No products imported yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productName")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productBrand")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productCategory")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Owner</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{product.name}</td>
                  <td className="py-3 px-2">{product.brand || "—"}</td>
                  <td className="py-3 px-2">{product.category || "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{product.ownerName || product.userId || "—"}</td>
                  <td className="py-3 px-2">
                    <Badge tone={(CAMPAIGN_STATUS_COLORS[product.status] as any) || "muted"}>{product.status || "active"}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {product.url && (
                        <Button variant="ghost" size="icon-sm" onClick={() => window.open(product.url, "_blank")}>
                          <ExternalLink className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Megaphone className="size-4" />
            {t("affiliateStudio.totalCampaigns")}
          </div>
          <div className="text-2xl font-semibold">{analytics.totalCampaigns ?? 0}</div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="size-4" />
            {t("affiliateStudio.activeCampaigns")}
          </div>
          <div className="text-2xl font-semibold">{analytics.activeCampaigns ?? 0}</div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Package className="size-4" />
            {t("affiliateStudio.totalProducts")}
          </div>
          <div className="text-2xl font-semibold">{analytics.totalProducts ?? 0}</div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="size-4" />
            Total Users
          </div>
          <div className="text-2xl font-semibold">{analytics.totalUsers ?? 0}</div>
        </DashboardCard>
      </div>

      <DashboardCard title="Campaign Performance" description="Stats across all affiliate campaigns">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <BarChart3 className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Analytics data will appear as campaigns run</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("affiliateStudio.title"), href: "/admin/affiliate-studio" },
          ]}
        />
        <PageHeader
          title={t("affiliateStudio.title")}
          description={t("affiliateStudio.description")}
        />

        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "templates" && renderTemplates()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>
    </PageContainer>
  );
}
