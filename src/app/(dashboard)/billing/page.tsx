"use client";

import * as React from "react";
import useSWR from "swr";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Receipt } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BillingPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const { data, error, isLoading } = useSWR("/api/billing", fetcher);

  if (isLoading) {
    return (
      <AppShell>
        <PageLayout title={t("billing.title")} description={t("billing.description")} breadcrumb={[{ label: t("billing.title") }]}>
          <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
        </PageLayout>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <PageLayout title={t("billing.title")} description={t("billing.description")} breadcrumb={[{ label: t("billing.title") }]}>
          <div className="text-destructive p-8">{t("billing.failedToLoad")}</div>
        </PageLayout>
      </AppShell>
    );
  }

  const invoices = data.invoices || [];

  return (
    <AppShell>
      <PageLayout
        title={t("billing.title")}
        description={t("billing.description")}
        breadcrumb={[{ label: t("billing.title") }]}
        actions={<ActionButton>{t("billing.upgradePlan")}</ActionButton>}
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("billing.currentPlan")} value={data.plan} delta={data.nextInvoice ? `${formatCurrency(parseFloat(data.nextInvoice.replace("$", "") || 0))}/month` : undefined} />
            <StatCard title={t("billing.nextInvoice")} value={data.nextInvoice ?? formatCurrency(0)} delta={data.nextInvoiceDate ?? ""} />
            <StatCard title={t("billing.paymentMethod")} value={data.paymentMethod ?? ""} delta={data.paymentExpiry ? `Expires ${data.paymentExpiry}` : undefined} />
            <StatCard title={t("billing.creditsRemaining")} value={data.creditsRemaining ?? 0} delta={data.creditsValue ? `${formatCurrency(parseFloat(data.creditsValue.replace("$", "") || 0))} value` : undefined} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCard title={t("billing.billingHistory")} description={t("billing.billingHistoryDesc")}>
                <div className="space-y-3">
                  {invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                          <Receipt className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{invoice.plan} Plan</h4>
                          <p className="text-xs text-muted-foreground">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{invoice.amount}</p>
                          <Badge tone={invoice.status === "Paid" ? "success" : invoice.status === "Upcoming" ? "info" : "muted"}>
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
              </DashboardCard>
            </div>

            <div className="space-y-6">
              <DashboardCard title={t("billing.paymentMethod")}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <CreditCard className="size-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{t("billing.paymentMethodCard")}</h4>
                      <p className="text-xs text-muted-foreground">{t("billing.paymentExpiry")}</p>
                    </div>
                    <Badge tone="success">{t("billing.default")}</Badge>
                  </div>
                  <Button variant="outline" className="w-full">{t("billing.addPaymentMethod")}</Button>
                </div>
              </DashboardCard>

              <DashboardCard title={t("billing.usageThisMonth")}>
                <div className="space-y-3">
                  {data.usage && Object.entries(data.usage).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}</span>
                        <span className="font-medium">{value.used.toLocaleString()} / {value.limit.toLocaleString()}{value.unit ? ` ${value.unit}` : ""}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (value.used / value.limit) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  );
}