"use client";

import * as React from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Receipt, ShoppingCart, ArrowUpRight } from "lucide-react";
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
      <AppShell>
        <PageLayout title={t("billing.title")} description={t("billing.description")} breadcrumb={[{ label: t("billing.title") }]}>
          <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
        </PageLayout>
      </AppShell>
    );
  }

  const plans = plansData?.data || [];
  const wallet = walletData?.data;
  const orders = ordersData?.data || [];
  const creditsRemaining = wallet?.availableCredits ?? 0;

  const paidOrders = orders.filter((o: any) => o.status === "paid");
  const invoices = paidOrders.map((o: any) => ({
    id: o.id,
    date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    amount: formatCurrency(o.total),
    status: o.status === "paid" ? "Paid" : o.status,
    plan: o.items?.[0]?.name ?? "Purchase",
  }));

  return (
    <AppShell>
      <PageLayout
        title={t("billing.title")}
        description={t("billing.description")}
        breadcrumb={[{ label: t("billing.title") }]}
      >
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title={t("billing.creditsRemaining")} value={creditsRemaining.toLocaleString()} />
            <StatCard title={t("billing.totalOrders")} value={String(paidOrders.length)} />
            <StatCard title={t("billing.walletStatus")} value={wallet ? "Active" : "None"} />
          </div>

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
              <DashboardCard title={t("billing.billingHistory")} description={t("billing.billingHistoryDesc")}>
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("billing.noInvoices")}</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                            <Receipt className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{invoice.plan}</h4>
                            <p className="text-xs text-muted-foreground">{invoice.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{invoice.amount}</p>
                            <Badge tone={invoice.status === "Paid" ? "success" : "info"}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="size-8">
                            <Download className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardCard>
            </div>

            <div className="space-y-6">
              <DashboardCard title={t("billing.walletBalance")}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <CreditCard className="size-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{formatCurrency(creditsRemaining)}</h4>
                      <p className="text-xs text-muted-foreground">{t("billing.creditsRemaining")}</p>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  );
}
