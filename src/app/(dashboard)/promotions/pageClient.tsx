"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Megaphone,
  Ticket,
  Gift,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Timer,
  Copy,
  History,
  Tag,
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

type Campaign = {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  startsAt: string;
  endsAt: string;
  bannerUrl?: string;
};

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  campaignName?: string;
  status: string;
  claimedAt?: string;
  expiresAt?: string;
};

type TabId = "active" | "coupons" | "vouchers" | "history";

function CountdownTimer({ endsAt, t }: { endsAt: string; t: (key: string, fallback?: string) => string }) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const end = new Date(endsAt).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const expired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (expired) return <span className="text-xs text-muted-foreground">{t("promotions.expired")}</span>;

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Timer className="size-3" />
      <span>{t("promotions.expiresIn")}</span>
      {timeLeft.days > 0 && <span className="font-medium text-foreground">{timeLeft.days} {t("promotions.days")}</span>}
      {timeLeft.hours > 0 && <span className="font-medium text-foreground">{timeLeft.hours} {t("promotions.hours")}</span>}
      <span className="font-medium text-foreground">{timeLeft.minutes}m {timeLeft.seconds}s</span>
    </div>
  );
}

export function PromotionsPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabId>("active");

  const { data: campaignsData, isLoading: campaignsLoading } = useSWR("/api/admin/campaigns?public=true", fetcher, {
    revalidateOnFocus: false,
  });

  const { data: couponsData, isLoading: couponsLoading } = useSWR("/api/admin/campaigns/coupons", fetcher, {
    revalidateOnFocus: false,
  });

  const campaigns: Campaign[] = React.useMemo(() => {
    if (Array.isArray(campaignsData?.data)) return campaignsData.data;
    if (Array.isArray(campaignsData)) return campaignsData;
    return [];
  }, [campaignsData]);

  const coupons: Coupon[] = React.useMemo(() => {
    if (Array.isArray(couponsData?.data)) return couponsData.data;
    if (Array.isArray(couponsData)) return couponsData;
    return [];
  }, [couponsData]);

  const activeCampaigns = React.useMemo(() =>
    campaigns.filter((c) => c.status === "active"),
    [campaigns]
  );

  const expiringCampaigns = React.useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return activeCampaigns.filter((c) => {
      if (!c.endsAt) return false;
      const end = new Date(c.endsAt).getTime();
      return end - now > 0 && end - now < sevenDays;
    });
  }, [activeCampaigns]);

  const availableCoupons = React.useMemo(() =>
    coupons.filter((c) => c.status === "active" && !c.claimedAt),
    [coupons]
  );

  const claimedCoupons = React.useMemo(() =>
    coupons.filter((c) => c.claimedAt),
    [coupons]
  );

  const loading = campaignsLoading || couponsLoading;

  const handleClaimCoupon = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/campaigns/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponId: coupon.id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to claim coupon");
      toast.success(t("promotions.claimed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to claim coupon");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success(t("admin.copied", "Copied to clipboard"));
    });
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "active", label: t("promotions.activeOffers"), icon: <Megaphone className="size-4" /> },
    { id: "coupons", label: t("promotions.myCoupons"), icon: <Ticket className="size-4" /> },
    { id: "vouchers", label: t("promotions.myVouchers"), icon: <Gift className="size-4" /> },
    { id: "history", label: t("promotions.history"), icon: <History className="size-4" /> },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title={t("promotions.title")}
          description={t("promotions.description")}
        />

        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {activeTab === "active" && (
              <div className="space-y-6">
                {expiringCampaigns.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                      <Clock className="size-5 text-amber-500" />
                      {t("promotions.expiresIn", "Expiring Soon")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {expiringCampaigns.map((campaign) => (
                        <DashboardCard key={campaign.id}>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-heading font-semibold">{campaign.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                              </div>
                              <Badge tone="warning">{t(`admin.campaignTypes.${campaign.type}`, campaign.type)}</Badge>
                            </div>
                            {campaign.discountValue && (
                              <div className="text-lg font-bold text-primary">
                                {campaign.discountType === "percentage" ? `${campaign.discountValue}% OFF` : `$${campaign.discountValue} OFF`}
                              </div>
                            )}
                            <CountdownTimer endsAt={campaign.endsAt} t={t} />
                          </div>
                        </DashboardCard>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                    <Megaphone className="size-5" />
                    {t("promotions.activeOffers")}
                  </h3>
                  {activeCampaigns.length === 0 ? (
                    <DashboardCard>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Megaphone className="size-12 text-muted-foreground mb-4 opacity-40" />
                        <p className="text-muted-foreground">{t("promotions.noPromotions")}</p>
                      </div>
                    </DashboardCard>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeCampaigns.map((campaign) => (
                        <DashboardCard key={campaign.id}>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-heading font-semibold">{campaign.name}</h4>
                              <Badge tone="success">{campaign.status}</Badge>
                            </div>
                            {campaign.description && (
                              <p className="text-sm text-muted-foreground">{campaign.description}</p>
                            )}
                            {campaign.discountValue && (
                              <div className="text-lg font-bold text-primary">
                                {campaign.discountType === "percentage" ? `${campaign.discountValue}% OFF` : `$${campaign.discountValue} OFF`}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Tag className="size-3" />
                              <code className="bg-muted px-1.5 py-0.5 rounded">{campaign.code}</code>
                              <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => handleCopyCode(campaign.code)}>
                                <Copy className="size-3" />
                              </Button>
                            </div>
                            {campaign.endsAt && (
                              <CountdownTimer endsAt={campaign.endsAt} t={t} />
                            )}
                          </div>
                        </DashboardCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "coupons" && (
              <div className="space-y-4">
                {availableCoupons.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-heading text-lg font-semibold">{t("promotions.activeOffers")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableCoupons.map((coupon) => (
                        <DashboardCard key={coupon.id}>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{coupon.code}</code>
                              {coupon.campaignName && (
                                <p className="text-xs text-muted-foreground">{coupon.campaignName}</p>
                              )}
                              <p className="text-sm font-medium">
                                {coupon.type === "percentage" ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                              </p>
                            </div>
                            <Button size="sm" onClick={() => handleClaimCoupon(coupon)}>
                              <Gift className="mr-2 size-4" />
                              {t("promotions.claimNow")}
                            </Button>
                          </div>
                        </DashboardCard>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="font-heading text-lg font-semibold">{t("promotions.myCoupons")}</h3>
                  {claimedCoupons.length === 0 ? (
                    <DashboardCard>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Ticket className="size-12 text-muted-foreground mb-4 opacity-40" />
                        <p className="text-muted-foreground">{t("promotions.noCoupons")}</p>
                      </div>
                    </DashboardCard>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {claimedCoupons.map((coupon) => (
                        <DashboardCard key={coupon.id}>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{coupon.code}</code>
                              <p className="text-sm font-medium">
                                {coupon.type === "percentage" ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {coupon.claimedAt && `${t("promotions.claimed")} ${new Date(coupon.claimedAt).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleCopyCode(coupon.code)}>
                                <Copy className="mr-2 size-4" />
                                {t("common.copy")}
                              </Button>
                            </div>
                          </div>
                        </DashboardCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "vouchers" && (
              <DashboardCard>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Gift className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("promotions.noVouchers")}</p>
                </div>
              </DashboardCard>
            )}

            {activeTab === "history" && (
              <DashboardCard>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("common.noData")}</p>
                </div>
              </DashboardCard>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
