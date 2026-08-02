"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MousePointerClick, DollarSign, Users, Copy, ExternalLink, BarChart3, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AffiliatePageClient() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [applying, setApplying] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/user/affiliate", fetcher);

  const affiliateData = data?.data;
  const status = affiliateData?.status || "none";
  const affiliate = affiliateData?.affiliate;

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await fetch("/api/user/affiliate", { method: "POST" });
      if (res.ok) {
        mutate();
        toast.success(t("affiliate.applied", "Application submitted"));
      }
    } finally {
      setApplying(false);
    }
  };

  const handleCopyLink = () => {
    if (affiliate?.affiliateLink) {
      navigator.clipboard.writeText(affiliate.affiliateLink);
      toast.success(t("affiliate.linkCopied", "Affiliate link copied"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
    );
  }

  if (status === "none") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("affiliate.title", "Affiliate Center")}</h1>
          <p className="text-muted-foreground mt-1">{t("affiliate.description", "Earn commissions by promoting Tamer Studio")}</p>
        </div>
        <DashboardCard title={t("affiliate.joinProgram", "Join Affiliate Program")}>
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="size-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {t("affiliate.joinDesc", "Apply to become an affiliate and start earning commissions for every customer you refer.")}
            </p>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? t("common.applying", "Applying...") : t("affiliate.applyNow", "Apply Now")}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("affiliate.title", "Affiliate Center")}</h1>
          <p className="text-muted-foreground mt-1">{t("affiliate.description", "Earn commissions by promoting Tamer Studio")}</p>
        </div>
        <DashboardCard title={t("affiliate.pendingReview", "Application Under Review")}>
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="size-8 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {t("affiliate.pendingDesc", "Your application is being reviewed. We will notify you once it is approved.")}
            </p>
            <Badge tone="warning">{t("common.pending", "Pending")}</Badge>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("affiliate.title", "Affiliate Center")}</h1>
          <p className="text-muted-foreground mt-1">{t("affiliate.description", "Earn commissions by promoting Tamer Studio")}</p>
        </div>
        <DashboardCard title={t("affiliate.applicationRejected", "Application Rejected")}>
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-8 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {t("affiliate.rejectedDesc", "Your application was not approved. Please contact support for more information.")}
            </p>
            <Badge tone="warning">{t("common.rejected", "Rejected")}</Badge>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("affiliate.title", "Affiliate Center")}</h1>
          <p className="text-muted-foreground mt-1">{t("affiliate.description", "Earn commissions by promoting Tamer Studio")}</p>
        </div>
        <Badge tone="success">{t("affiliate.approved", "Approved")}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("affiliate.totalClicks", "Total Clicks")}
          value={affiliate?.totalClicks ?? 0}
        />
        <StatCard
          title={t("affiliate.conversions", "Conversions")}
          value={affiliate?.totalConversions ?? 0}
        />
        <StatCard
          title={t("affiliate.totalRevenue", "Total Revenue")}
          value={formatCurrency(Number(affiliate?.totalRevenue ?? 0))}
        />
        <StatCard
          title={t("affiliate.totalCommission", "Total Commission")}
          value={formatCurrency(Number(affiliate?.totalCommission ?? 0))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title={t("affiliate.yourLink", "Your Affiliate Link")}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <ExternalLink className="size-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{affiliate?.affiliateLink}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                <Copy className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <span className="text-sm text-muted-foreground shrink-0">{t("affiliate.code", "Code")}:</span>
              <code className="text-sm font-mono font-medium flex-1">{affiliate?.affiliateCode}</code>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title={t("affiliate.commissionBreakdown", "Commission Breakdown")}>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-5 text-green-500" />
                <span className="text-sm font-medium">{t("affiliate.commissionRate", "Commission Rate")}</span>
              </div>
              <span className="font-semibold">{Number(affiliate?.commissionRate ?? 0.1) * 100}%</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="size-5 text-blue-500" />
                <span className="text-sm font-medium">{t("affiliate.pendingCommission", "Pending")}</span>
              </div>
              <span className="font-semibold">{formatCurrency(Number(affiliate?.pendingCommission ?? 0))}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-5 text-green-500" />
                <span className="text-sm font-medium">{t("affiliate.paidCommission", "Paid")}</span>
              </div>
              <span className="font-semibold">{formatCurrency(Number(affiliate?.paidCommission ?? 0))}</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title={t("affiliate.performance", "Performance")} description={t("affiliate.performanceDesc", "Your affiliate performance over time")}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <BarChart3 className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("affiliate.noChartData", "Performance chart will appear as you generate referrals")}</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
