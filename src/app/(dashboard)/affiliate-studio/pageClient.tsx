"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Megaphone,
  Package,
  FileText,
  Image,
  Send,
  History,
  Plus,
  Upload,
  Sparkles,
  ExternalLink,
  Loader2,
  Zap,
  BookOpen,
  Rocket,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "home" | "campaigns" | "products" | "scripts" | "thumbnails" | "publishing" | "history";

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  active: "success",
  draft: "muted",
  completed: "info",
  paused: "warning",
  failed: "destructive",
};

export function AffiliateStudioPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("home");

  const { data: statsData, isLoading: statsLoading } = useSWR("/api/affiliate/stats", fetcher);
  const { data: campaignsData, isLoading: campaignsLoading } = useSWR("/api/affiliate/campaigns", fetcher);
  const { data: productsData, isLoading: productsLoading } = useSWR("/api/affiliate/products", fetcher);
  const { data: scriptsData, isLoading: scriptsLoading } = useSWR("/api/affiliate/scripts", fetcher);
  const { data: thumbnailsData, isLoading: thumbnailsLoading } = useSWR("/api/affiliate/thumbnails", fetcher);
  const { data: publishingData, isLoading: publishingLoading } = useSWR("/api/affiliate/publishing", fetcher);
  const { data: historyData, isLoading: historyLoading } = useSWR("/api/affiliate/history", fetcher);

  const stats = statsData?.data ?? {};
  const campaigns = campaignsData?.data ?? [];
  const products = productsData?.data ?? [];
  const scripts = scriptsData?.data ?? [];
  const thumbnails = thumbnailsData?.data ?? [];
  const publishingQueue = publishingData?.data ?? [];
  const historyJobs = historyData?.data ?? [];

  const tabs = [
    { id: "home" as Tab, label: t("affiliateStudio.home"), icon: Megaphone },
    { id: "campaigns" as Tab, label: t("affiliateStudio.campaigns"), icon: Megaphone },
    { id: "products" as Tab, label: t("affiliateStudio.products"), icon: Package },
    { id: "scripts" as Tab, label: t("affiliateStudio.scripts"), icon: FileText },
    { id: "thumbnails" as Tab, label: t("affiliateStudio.thumbnails"), icon: Image },
    { id: "publishing" as Tab, label: t("affiliateStudio.publishing"), icon: Send },
    { id: "history" as Tab, label: t("affiliateStudio.history"), icon: History },
  ];

  const renderHome = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("affiliateStudio.totalCampaigns")} value={stats.totalCampaigns ?? 0} />
        <StatCard title={t("affiliateStudio.activeCampaigns")} value={stats.activeCampaigns ?? 0} />
        <StatCard title={t("affiliateStudio.totalProducts")} value={stats.totalProducts ?? 0} />
        <StatCard title={t("affiliateStudio.creditsUsed")} value={stats.creditsUsed ?? 0} />
      </div>

      <DashboardCard title={t("affiliateStudio.home")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/affiliate-studio/campaign">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plus className="size-6 text-primary" />
              </div>
              <span className="font-medium">{t("affiliateStudio.newCampaign")}</span>
            </div>
          </Link>
          <button
            onClick={() => toast.info(t("affiliateStudio.importProduct"))}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-6 text-primary" />
            </div>
            <span className="font-medium">{t("affiliateStudio.importProduct")}</span>
          </button>
          <button
            onClick={() => toast.info(t("affiliateStudio.generateAll"))}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-6 text-primary" />
            </div>
            <span className="font-medium">{t("affiliateStudio.generateAll")}</span>
          </button>
        </div>
      </DashboardCard>

      <DashboardCard title={t("affiliateStudio.campaigns")}>
        {campaignsLoading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{t("affiliateStudio.noCampaigns")}</p>
            <Link href="/affiliate-studio/campaign">
              <Button size="sm"><Plus className="mr-2 size-4" />{t("affiliateStudio.createCampaign")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign: any) => (
              <div key={campaign.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Megaphone className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">{campaign.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={(CAMPAIGN_STATUS_COLORS[campaign.status] as any) || "muted"}>{campaign.status}</Badge>
                  <Link href={`/affiliate-studio/campaign?id=${campaign.id}`}>
                    <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title={t("affiliateStudio.title")} description={t("affiliateStudio.description")}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <Zap className="size-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{t("affiliateStudio.createCampaign")}</p>
              <p className="text-xs text-muted-foreground">{t("affiliateStudio.description")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <BookOpen className="size-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{t("affiliateStudio.scripts")}</p>
              <p className="text-xs text-muted-foreground">{t("affiliateStudio.noScripts")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
            <Rocket className="size-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{t("affiliateStudio.publishing")}</p>
              <p className="text-xs text-muted-foreground">{t("affiliateStudio.description")}</p>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );

  const renderCampaigns = () => (
    <DashboardCard title={t("affiliateStudio.campaigns")}>
      {campaignsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Megaphone className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{t("affiliateStudio.noCampaigns")}</p>
          <Link href="/affiliate-studio/campaign">
            <Button size="sm"><Plus className="mr-2 size-4" />{t("affiliateStudio.createCampaign")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign: any) => (
            <div key={campaign.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground">{campaign.type}</p>
                </div>
                <Badge tone={(CAMPAIGN_STATUS_COLORS[campaign.status] as any) || "muted"}>{campaign.status}</Badge>
              </div>
              {campaign.platforms && (
                <div className="flex gap-1 flex-wrap">
                  {campaign.platforms.map((p: string) => (
                    <Badge key={p} tone="info">{p}</Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Link href={`/affiliate-studio/campaign?id=${campaign.id}`}>
                  <Button variant="outline" size="sm">{t("affiliateStudio.viewCampaign")}</Button>
                </Link>
                <Button variant="ghost" size="sm">{t("affiliateStudio.publishCampaign")}</Button>
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
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{t("affiliateStudio.noProducts")}</p>
          <Button size="sm" onClick={() => toast.info(t("affiliateStudio.importProduct"))}>
            <Upload className="mr-2 size-4" />{t("affiliateStudio.importProduct")}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productName")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productBrand")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productCategory")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.productUrl")}</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{product.name}</td>
                  <td className="py-3 px-2">{product.brand || "—"}</td>
                  <td className="py-3 px-2">{product.category || "—"}</td>
                  <td className="py-3 px-2 truncate max-w-[200px]">
                    {product.url ? (
                      <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {product.url}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  const renderScripts = () => (
    <DashboardCard title={t("affiliateStudio.scripts")}>
      {scriptsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : scripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("affiliateStudio.noScripts")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((script: any) => (
            <div key={script.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{script.title}</p>
                  <p className="text-xs text-muted-foreground">{script.platform} · {script.type}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderThumbnails = () => (
    <DashboardCard title={t("affiliateStudio.thumbnails")}>
      {thumbnailsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : thumbnails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Image className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("affiliateStudio.noThumbnails")}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {thumbnails.map((thumb: any) => (
            <div key={thumb.id} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Image className="size-8 text-muted-foreground/50" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{thumb.name || "Thumbnail"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderPublishing = () => (
    <DashboardCard title={t("affiliateStudio.publishing")}>
      {publishingLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : publishingQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Send className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("affiliateStudio.noCampaigns")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {publishingQueue.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <Send className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{item.title || item.campaignName}</p>
                  <p className="text-xs text-muted-foreground">{item.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={(CAMPAIGN_STATUS_COLORS[item.status] as any) || "muted"}>{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderHistory = () => (
    <DashboardCard title={t("affiliateStudio.history")}>
      {historyLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : historyJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <History className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("affiliateStudio.noCampaigns")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("affiliateStudio.campaigns")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.type", "Type")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date")}</th>
              </tr>
            </thead>
            <tbody>
              {historyJobs.map((job: any) => (
                <tr key={job.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{job.name || job.campaignName || "—"}</td>
                  <td className="py-3 px-2">{job.type || "—"}</td>
                  <td className="py-3 px-2">
                    <Badge tone={(CAMPAIGN_STATUS_COLORS[job.status] as any) || "muted"}>{job.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("affiliateStudio.title")}
        description={t("affiliateStudio.description")}
        actions={
          <Link href="/affiliate-studio/campaign">
            <Button><Plus className="mr-2 size-4" />{t("affiliateStudio.newCampaign")}</Button>
          </Link>
        }
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

      {activeTab === "home" && renderHome()}
      {activeTab === "campaigns" && renderCampaigns()}
      {activeTab === "products" && renderProducts()}
      {activeTab === "scripts" && renderScripts()}
      {activeTab === "thumbnails" && renderThumbnails()}
      {activeTab === "publishing" && renderPublishing()}
      {activeTab === "history" && renderHistory()}
    </div>
  );
}
