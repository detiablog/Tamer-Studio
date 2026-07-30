"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, Plus, Trash2, Loader, X, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url).then((r) => { if (!r.ok) throw new Error(`API error: ${r.status}`); return r.json(); });

const PLAN_OPTIONS = [
  { value: "lite", name: "Lite", description: "For individuals getting started", defaultPrice: 0, credits: 100 },
  { value: "creator", name: "Creator", description: "For creators and small teams", defaultPrice: 29, credits: 500, popular: true },
  { value: "pro", name: "Pro", description: "For professionals and agencies", defaultPrice: 99, credits: 2000 },
];

const BILLING_OPTIONS = [
  { value: "onetime", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

interface NewSubscriptionForm {
  plan: string;
  billingCycle: string;
  workspaceId: string;
  userId: string;
  amount: number;
}

export default function SubscriptionsPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [search, setSearch] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newSub, setNewSub] = React.useState<NewSubscriptionForm>({
    plan: "creator",
    billingCycle: "monthly",
    workspaceId: "",
    userId: "",
    amount: 29,
  });

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
    () => subscriptions.filter((s: any) =>
      (s.plan || s.planName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.workspace || s.workspaceName || "").toLowerCase().includes(search.toLowerCase())
    ),
    [subscriptions, search]
  );

  const stats = React.useMemo(() => ({
    total: subscriptions.length,
    active: subscriptions.filter((s: any) => s.status === "active" || s.status === "Active").length,
    cancelled: subscriptions.filter((s: any) => s.status === "cancelled" || s.status === "Cancelled").length,
  }), [subscriptions]);

  const handleCancel = async (id: string) => {
    if (!confirm(t("admin.subscriptions.cancelConfirm", "Cancel this subscription?"))) return;
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("admin.subscriptions.cancelled", "Subscription cancelled"));
      mutate();
    } catch {
      toast.error(t("admin.subscriptions.cancelFailed", "Failed to cancel subscription"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.subscriptions.deleteConfirm", "Permanently delete this subscription?"))) return;
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("admin.subscriptions.deleted", "Subscription deleted"));
      mutate();
    } catch {
      toast.error(t("admin.subscriptions.deleteFailed", "Failed to delete subscription"));
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("admin.subscriptions.reactivated", "Subscription reactivated"));
      mutate();
    } catch {
      toast.error(t("admin.subscriptions.reactivateFailed", "Failed to reactivate"));
    }
  };

  const handleAdd = async () => {
    if (!newSub.plan || !newSub.workspaceId || !newSub.userId) {
      toast.error(t("admin.subscriptions.fillRequired", "Please fill all required fields"));
      return;
    }
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan: newSub.plan,
          workspaceId: newSub.workspaceId,
          userId: newSub.userId,
          status: "active",
          billingCycle: newSub.billingCycle,
          amount: newSub.amount,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + (newSub.billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("admin.subscriptions.created", "Subscription created"));
      setShowAddForm(false);
      setNewSub({ plan: "creator", billingCycle: "monthly", workspaceId: "", userId: "", amount: 29 });
      mutate();
    } catch {
      toast.error(t("admin.subscriptions.createFailed", "Failed to create subscription"));
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />{t("common.refresh", "Refresh")}
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
              <Plus className="size-4" />{t("admin.subscriptions.add", "Add Subscription")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{t("admin.subscriptions.total", "Total")}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-green-500/5 p-3">
            <p className="text-xs text-muted-foreground">{t("admin.subscriptions.active", "Active")}</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="rounded-lg border bg-red-500/5 p-3">
            <p className="text-xs text-muted-foreground">{t("admin.subscriptions.cancelled", "Cancelled")}</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 rounded-lg border bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t("admin.subscriptions.newSubscription", "New Subscription")}</h3>
              <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("admin.subscriptions.plan", "Plan")}</Label>
                <select value={newSub.plan} onChange={(e) => {
                  const plan = PLAN_OPTIONS.find(p => p.value === e.target.value);
                  setNewSub({ ...newSub, plan: e.target.value, amount: plan?.defaultPrice || 0 });
                }} className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm">
                  {PLAN_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.name} — {p.description} ({p.defaultPrice === 0 ? "Free" : "$" + p.defaultPrice + "/mo"})</option>)}
                </select>
              </div>
              <div>
                <Label>{t("admin.subscriptions.billingCycle", "Billing Cycle")}</Label>
                <select value={newSub.billingCycle} onChange={(e) => {
                  const cycle = e.target.value;
                  const plan = PLAN_OPTIONS.find(p => p.value === newSub.plan);
                  const multiplier = cycle === "yearly" ? 12 * 0.8 : cycle === "monthly" ? 1 : 0;
                  setNewSub({ ...newSub, billingCycle: cycle, amount: Math.round((plan?.defaultPrice || 0) * multiplier) });
                }} className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm">
                  {BILLING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label>{t("admin.subscriptions.workspaceId", "Workspace ID")} *</Label>
                <Input value={newSub.workspaceId} onChange={(e) => setNewSub({ ...newSub, workspaceId: e.target.value })} placeholder="ws_xxx" className="mt-1" />
              </div>
              <div>
                <Label>{t("admin.subscriptions.userId", "User ID")} *</Label>
                <Input value={newSub.userId} onChange={(e) => setNewSub({ ...newSub, userId: e.target.value })} placeholder="user_xxx" className="mt-1" />
              </div>
              <div>
                <Label>{t("admin.subscriptions.amount", "Amount")} ($)</Label>
                <Input type="number" value={newSub.amount} onChange={(e) => setNewSub({ ...newSub, amount: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>{t("common.cancel", "Cancel")}</Button>
              <Button size="sm" onClick={handleAdd}>{t("admin.subscriptions.create", "Create Subscription")}</Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.subscriptions.search", "Search subscriptions...")} className="pl-9" />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.subscriptions.noSubscriptions", "No subscriptions found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(s) => s.id}
            columns={[
              { key: "plan", header: t("admin.subscriptions.plan", "Plan"), render: (s: any) => <Badge tone={s.status === "active" ? "success" : "muted"}>{s.plan || s.planName || "-"}</Badge> },
              { key: "workspace", header: t("admin.subscriptions.workspace", "Workspace"), render: (s: any) => <span className="text-sm">{s.workspace || s.workspaceName || "-"}</span> },
              { key: "status", header: t("common.status", "Status"), render: (s: any) => <Badge tone={s.status === "active" ? "success" : s.status === "cancelled" ? "muted" : "warning"}>{s.status}</Badge> },
              { key: "amount", header: t("common.amount", "Amount"), render: (s: any) => <span className="font-medium text-sm">{formatCurrency(s.amount || 0)}</span> },
              { key: "billingCycle", header: t("admin.subscriptions.cycle", "Cycle"), render: (s: any) => <span className="text-sm capitalize">{s.billingCycle || "-"}</span> },
              { key: "currentPeriodEnd", header: t("admin.subscriptions.nextBilling", "Next Billing"), render: (s: any) => <span className="text-sm text-muted-foreground">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "-"}</span> },
              { key: "actions", header: "", align: "right" as const, render: (s: any) => (
                <div className="flex items-center gap-1 justify-end">
                  {s.status === "active"
                    ? <Button variant="ghost" size="sm" onClick={() => handleCancel(s.id)} className="text-destructive text-xs">{t("admin.subscriptions.cancel", "Cancel")}</Button>
                    : <Button variant="ghost" size="sm" onClick={() => handleReactivate(s.id)} className="text-xs">{t("admin.subscriptions.reactivate", "Reactivate")}</Button>
                  }
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-destructive text-xs">{t("admin.subscriptions.delete", "Delete")}</Button>
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>
    </div>
  );
}
