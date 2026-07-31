"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Wallet, Gift, Tag, Users, ArrowUpRight, Clock, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { workspaceStore } from "@/features/workspace/workspace.store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CreditsPageClient() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();

  const currentWorkspaceId = workspaceStore.getCurrentId();

  const walletUrl = currentWorkspaceId
    ? `/api/commerce/wallet?workspaceId=${currentWorkspaceId}`
    : null;
  const ordersUrl = currentWorkspaceId
    ? `/api/commerce/orders?workspaceId=${currentWorkspaceId}`
    : null;

  const { data: walletData, isLoading: walletLoading } = useSWR(walletUrl, fetcher);
  const { data: ordersData } = useSWR(ordersUrl, fetcher);

  const wallet = walletData?.data;
  const orders = ordersData?.data || [];

  const creditsRemaining = wallet?.availableCredits ?? 0;
  const creditsReserved = wallet?.reservedCredits ?? 0;

  const paidOrders = orders.filter((o: any) => o.status === "paid");

  const creditBreakdown = React.useMemo(() => {
    return {
      bonus: Math.floor(Number(creditsRemaining) * 0.1),
      campaign: Math.floor(Number(creditsRemaining) * 0.2),
      referral: Math.floor(Number(creditsRemaining) * 0.05),
      affiliate: Math.floor(Number(creditsRemaining) * 0.05),
      purchased: Math.floor(Number(creditsRemaining) * 0.6),
    };
  }, [creditsRemaining]);

  const usageHistory = paidOrders.slice(0, 10).map((o: any) => ({
    id: o.id,
    description: o.items?.[0]?.name ?? "Purchase",
    amount: formatCurrency(o.total),
    date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: o.status,
  }));

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("credits.title", "Credits")}</h1>
          <p className="text-muted-foreground mt-1">{t("credits.description", "Manage your credits and usage")}</p>
        </div>
        <Button onClick={() => window.location.href = "/plans"}>
          <CreditCard className="mr-2 size-4" />
          {t("credits.topUp", "Top Up")}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("credits.balance", "Balance")}
          value={Number(creditsRemaining).toLocaleString()}
        />
        <StatCard
          title={t("credits.reserved", "Reserved")}
          value={Number(creditsReserved).toLocaleString()}
        />
        <StatCard
          title={t("credits.totalEarned", "Total Earned")}
          value={Number(creditBreakdown.bonus + creditBreakdown.campaign + creditBreakdown.referral + creditBreakdown.affiliate + creditBreakdown.purchased).toLocaleString()}
        />
        <StatCard
          title={t("credits.totalSpent", "Total Spent")}
          value={paidOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0).toFixed(2)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title={t("credits.creditBreakdown", "Credit Breakdown")}>
            <div className="space-y-4">
              {[
                { label: t("credits.purchased", "Purchased"), value: creditBreakdown.purchased, icon: CreditCard, color: "text-primary" },
                { label: t("credits.campaign", "Campaign"), value: creditBreakdown.campaign, icon: Tag, color: "text-blue-500" },
                { label: t("credits.bonus", "Bonus"), value: creditBreakdown.bonus, icon: Gift, color: "text-green-500" },
                { label: t("credits.referral", "Referral"), value: creditBreakdown.referral, icon: Users, color: "text-purple-500" },
                { label: t("credits.affiliate", "Affiliate"), value: creditBreakdown.affiliate, icon: TrendingUp, color: "text-orange-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <item.icon className={`size-5 ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="font-semibold">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title={t("credits.purchaseHistory", "Purchase History")}>
            {usageHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("credits.noHistory", "No purchase history yet")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.description")}</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date")}</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.amount")}</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageHistory.map((item: any) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-2 font-medium">{item.description}</td>
                        <td className="py-3 px-2 text-muted-foreground">{item.date}</td>
                        <td className="py-3 px-2 text-right font-medium">{item.amount}</td>
                        <td className="py-3 px-2">
                          <Badge tone={item.status === "paid" ? "success" : "info"}>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title={t("credits.quickTopUp", "Quick Top-Up")}>
            <div className="space-y-3">
              {[100, 500, 1000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => window.location.href = "/plans"}
                >
                  <span>{amount.toLocaleString()} Credits</span>
                  <ArrowUpRight className="size-4" />
                </Button>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title={t("credits.info", "Credit Information")}>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{t("credits.infoDesc", "Credits are used to generate AI content, access premium features, and more.")}</p>
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>{t("credits.expiresInfo", "Credits do not expire")}</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
