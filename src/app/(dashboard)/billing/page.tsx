"use client";

import * as React from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Download,
  Receipt,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wallet,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { workspaceStore } from "@/features/workspace/workspace.store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BillingPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");

  const currentWorkspaceId = workspaceStore.getCurrentId();
  const [selectedBillingOption, setSelectedBillingOption] = React.useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  const plansUrl = "/api/commerce/plans";
  const walletUrl = currentWorkspaceId
    ? `/api/commerce/wallet?workspaceId=${currentWorkspaceId}`
    : null;
  const ordersUrl = currentWorkspaceId
    ? `/api/commerce/orders?workspaceId=${currentWorkspaceId}`
    : null;

  const { data: plansData, isLoading: plansLoading } = useSWR(plansUrl, fetcher);
  const { data: walletData } = useSWR(walletUrl, fetcher);
  const { data: ordersData } = useSWR(ordersUrl, fetcher);

  const handleCheckout = async (planId: string, billingOptionId: string) => {
    if (!currentWorkspaceId) return;
    setSelectedBillingOption(`${planId}-${billingOptionId}`);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/commerce/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: currentWorkspaceId,
          planId,
          billingOptionId,
        }),
      });
      const result = await res.json();
      if (result.success && result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
    } catch {
      setSelectedBillingOption(null);
      setCheckoutLoading(false);
    }
  };

  const isLoading = plansLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
    );
  }

  const plans = plansData?.data || [];
  const wallet = walletData?.data;
  const orders = ordersData?.data || [];
  const creditsRemaining = wallet?.availableCredits ?? 0;

  const paidOrders = orders.filter((o: any) => o.status === "paid");
  const allOrders = orders.filter((o: any) => o.status !== "cancelled");

  const totalSpent = paidOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const lastPayment = paidOrders.length > 0 ? paidOrders[0] : null;
  const lastPaymentDate = lastPayment
    ? new Date(lastPayment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const invoices = paidOrders.map((o: any) => ({
    id: o.id,
    date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    amount: formatCurrency(o.total),
    status: o.status === "paid" ? "Paid" : o.status,
    plan: o.items?.[0]?.name ?? "Purchase",
  }));

  const timeline = allOrders.slice(0, 10).map((o: any) => ({
    id: o.id,
    type: o.status === "paid" ? "payment" : o.status === "cancelled" ? "cancelled" : "pending",
    label: o.items?.[0]?.name ?? "Transaction",
    amount: formatCurrency(o.total),
    date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    status: o.status,
  }));

  const activePlan = plans.find((p: any) => p.isActive);

  return (
    <div className="space-y-6">
      {checkoutStatus === "success" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {t("billing.paymentSuccess")}
        </div>
      )}
      {checkoutStatus === "cancelled" && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          {t("billing.checkoutCancelled")}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-heading font-bold">{t("billing.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("billing.description")}</p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">{t("billing.overview", "Overview")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t("billing.totalSpent", "Total Spent")}
            value={formatCurrency(totalSpent)}
          />
          <StatCard
            title={t("billing.lastPayment", "Last Payment")}
            value={lastPaymentDate}
          />
          <StatCard
            title={t("billing.activeSubscription", "Active Subscription")}
            value={activePlan?.name ?? t("billing.freePlan")}
          />
          <StatCard
            title={t("billing.credits", "Credits")}
            value={creditsRemaining.toLocaleString()}
          />
        </div>
      </div>

      {activePlan && (
        <DashboardCard title={t("billing.currentPlan")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{activePlan.name}</h3>
                <p className="text-sm text-muted-foreground">{activePlan.description}</p>
              </div>
            </div>
            <Badge tone="success">{t("billing.current", "Current")}</Badge>
          </div>
        </DashboardCard>
      )}

      {plans.length > 0 && (
        <DashboardCard title={t("billing.availablePlans")} description={t("billing.upgradeDescription")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan: any) => (
              <div
                key={plan.id}
                className="relative flex flex-col rounded-xl border border-border bg-muted/10 p-4 hover:border-primary/50"
              >
                {plan.badge && (
                  <div className="absolute top-2 right-2"><Badge tone="success">{plan.badge}</Badge></div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                <div className="space-y-2 mb-4 flex-1">
                  {plan.pricings?.map((pricing: any) => (
                    <div key={pricing.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{pricing.billingOption?.name}</p>
                        <p className="text-lg font-bold">{formatCurrency(pricing.price)}</p>
                        <p className="text-xs text-muted-foreground">{pricing.creditsIncluded.toLocaleString()} credits</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCheckout(plan.id, pricing.billingOptionId)}
                        disabled={checkoutLoading && selectedBillingOption === `${plan.id}-${pricing.billingOptionId}`}
                      >
                        <ArrowUpRight className="mr-1 size-4" />
                        {checkoutLoading && selectedBillingOption === `${plan.id}-${pricing.billingOptionId}`
                          ? t("common.redirecting")
                          : t("billing.subscribe")}
                      </Button>
                    </div>
                  ))}
                </div>
                {plan.pricings?.length === 0 && (
                  <p className="text-xs text-muted-foreground">No pricing available</p>
                )}
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCard title={t("billing.paymentHistory")} description={t("billing.billingHistoryDesc")}>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("billing.noPayments", "No payment history yet")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.description")}</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date")}</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.amount")}</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice: any) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-2 font-medium">{invoice.plan}</td>
                        <td className="py-3 px-2 text-muted-foreground">{invoice.date}</td>
                        <td className="py-3 px-2 text-right font-medium">{invoice.amount}</td>
                        <td className="py-3 px-2">
                          <Badge tone={invoice.status === "Paid" ? "success" : "info"}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="icon" className="size-8">
                            <Download className="size-4" />
                          </Button>
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
          <DashboardCard title={t("billing.creditsRemaining")}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <Wallet className="size-8 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{creditsRemaining.toLocaleString()}</h4>
                  <p className="text-xs text-muted-foreground">{t("billing.creditsRemaining")}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => window.location.href = "#plans"}>
                <CreditCard className="mr-2 size-4" />
                {t("billing.purchaseCredits")}
              </Button>
            </div>
          </DashboardCard>

          <DashboardCard title={t("billing.transactionTimeline", "Transaction Timeline")}>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("billing.noPayments", "No payment history yet")}</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {item.type === "payment" ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : item.type === "cancelled" ? (
                        <XCircle className="size-4 text-muted-foreground" />
                      ) : (
                        <Clock className="size-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{item.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
