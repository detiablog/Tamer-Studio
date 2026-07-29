"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ArrowUpRight, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

export default function SubscriptionsPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [search, setSearch] = React.useState("");

  const { data, error, isLoading, mutate } = useSWR("/api/admin/subscriptions", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const subscriptions = React.useMemo(() => {
    if (data?.success) {
      if (Array.isArray(data.data)) return data.data;
      if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;
    }
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => subscriptions.filter((s: any) => s.plan?.toLowerCase().includes(search.toLowerCase()) || s.workspace?.toLowerCase().includes(search.toLowerCase())),
    [subscriptions, search]
  );

  const handleCancel = async (id: string) => {
    if (!confirm(t("admin.subscriptions.cancelConfirm", "Cancel this subscription?"))) return;
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!res.ok) throw new Error("Failed to cancel subscription");
      toast.success(t("admin.subscriptions.cancelled", "Subscription cancelled"));
      mutate();
    } catch {
      toast.error(t("admin.subscriptions.cancelFailed", "Failed to cancel subscription"));
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
      if (!res.ok) throw new Error("Failed to reactivate subscription");
      toast.success(t("admin.subscriptions.reactivated", "Subscription reactivated"));
      mutate();
    } catch {
      toast.error(t("admin.subscriptions.reactivateFailed", "Failed to reactivate subscription"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.subscriptions", "Subscriptions") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.subscriptions", "Subscriptions")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.subscriptions.description", "Manage subscriptions and plans")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.subscriptions", "Subscriptions") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.subscriptions", "Subscriptions")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.subscriptions.description", "Manage subscriptions and plans")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.subscriptions", "Subscriptions") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.subscriptions", "Subscriptions")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.subscriptions.description", "Manage subscriptions and plans")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { mutate(); toast.success(t("admin.subscriptions.synced", "Subscriptions refreshed")); }}><RefreshCw className="mr-2 size-4" />{t("common.refresh", "Refresh")}</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.subscriptions.search", "Search subscriptions...")} className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.subscriptions.noSubscriptions", "No subscriptions found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(s) => s.id}
            columns={[
              { key: "plan", header: t("admin.subscriptions.plan", "Plan"), render: (s: any) => <Badge>{s.plan}</Badge> },
              { key: "workspace", header: t("admin.subscriptions.workspace", "Workspace"), render: (s: any) => <span className="text-sm">{s.workspace}</span> },
              { key: "status", header: t("common.status", "Status"), render: (s: any) => <Badge tone={s.status === "Active" ? "success" : "muted"}>{s.status}</Badge> },
              { key: "amount", header: t("common.amount", "Amount"), render: (s: any) => <span className="font-medium text-sm">{formatCurrency(s.amount)}</span> },
              { key: "billingCycle", header: t("admin.subscriptions.cycle", "Cycle"), render: (s: any) => <span className="text-sm capitalize">{s.billingCycle}</span> },
              { key: "nextBilling", header: t("admin.subscriptions.nextBilling", "Next Billing"), render: (s: any) => <span className="text-sm text-muted-foreground">{s.nextBilling}</span> },
              { key: "actions", header: "", align: "right", render: (s: any) => (
                <div className="flex items-center gap-1 justify-end">
                  {s.status === "Active"
                    ? <Button variant="ghost" size="icon-xs" onClick={() => handleCancel(s.id)} className="text-destructive hover:text-destructive" aria-label={t("admin.subscriptions.cancel", "Cancel")}><ArrowUpRight className="size-3.5" />{t("admin.subscriptions.cancel", "Cancel")}</Button>
                    : <Button variant="ghost" size="icon-xs" onClick={() => handleReactivate(s.id)} aria-label={t("admin.subscriptions.reactivate", "Reactivate")}><ArrowUpRight className="size-3.5" />{t("admin.subscriptions.reactivate", "Reactivate")}</Button>
                  }
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}
