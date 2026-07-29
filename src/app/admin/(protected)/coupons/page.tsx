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
import { Search, Filter, Plus, RefreshCw, ToggleLeft, ToggleRight, Trash2, X, Loader } from "lucide-react";
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

export default function CouponsPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ code: "", discount: "", type: "Percentage", expires: "", status: "Active" });
  const [formLoading, setFormLoading] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/coupons", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const coupons = React.useMemo(() => {
    if (data?.success) {
      if (Array.isArray(data.data)) return data.data;
      if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;
    }
    return [];
  }, [data]);

  const filtered = React.useMemo(() => {
    return coupons.filter((c: any) => {
      const matchesSearch = (c.code || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create coupon");
      setFormData({ code: "", discount: "", type: "Percentage", expires: "", status: "Active" });
      setAddOpen(false);
      toast.success(t("admin.coupons.created", "Coupon created"));
      mutate();
    } catch {
      toast.error(t("admin.coupons.createFailed", "Failed to create coupon"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    const coupon = coupons.find((c: any) => c.id === id);
    const newStatus = coupon?.status === "Active" ? "Expired" : "Active";
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update coupon status");
      toast.success(t("admin.coupons.statusUpdated", "Coupon status updated"));
      mutate();
    } catch {
      toast.error(t("admin.coupons.statusUpdateFailed", "Failed to update coupon status"));
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(t("admin.coupons.deleteConfirm", 'Delete coupon "{0}"?').replace("{0}", code))) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");
      toast.success(t("admin.coupons.deleted", "Coupon deleted"));
      mutate();
    } catch {
      toast.error(t("admin.coupons.deleteFailed", "Failed to delete coupon"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.coupons", "Coupons") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.coupons", "Coupons")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.coupons.description", "Manage discount codes and promotions")}</p>
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
        <Breadcrumbs items={[{ label: t("admin.coupons", "Coupons") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.coupons", "Coupons")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.coupons.description", "Manage discount codes and promotions")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.coupons", "Coupons") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.coupons", "Coupons")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.coupons.description", "Manage discount codes and promotions")}</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 size-4" />{t("admin.add", "Add")} {t("admin.coupons.coupon", "Coupon")}</Button>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.coupons.search", "Search coupons...")} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}><Filter className="mr-2 size-4" />{t("common.filter", "Filter")}</Button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t("admin.coupons.allStatus", "All Status")}</option>
                <option value="active">{t("admin.active", "Active")}</option>
                <option value="expired">{t("admin.inactive", "Expired")}</option>
              </select>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.coupons.noCoupons", "No coupons found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(c) => c.id}
            columns={[
              { key: "code", header: t("admin.coupons.code", "Code"), render: (c: any) => <p className="font-medium text-sm">{c.code}</p> },
              { key: "discount", header: t("admin.coupons.discount", "Discount"), render: (c: any) => <span className="text-sm">{c.type === "Fixed" ? formatCurrency(c.discount || c.value) : c.discount || c.value} ({c.type})</span> },
              { key: "status", header: t("common.status", "Status"), render: (c: any) => <Badge tone={c.status === "Active" ? "success" : "muted"}>{c.status}</Badge> },
              { key: "usageCount", header: t("admin.coupons.usage", "Usage"), render: (c: any) => <span className="text-sm">{c.usageCount || c.uses || 0} / {c.maxUsage || c.limit || "\u221e"}</span> },
              { key: "expires", header: t("admin.coupons.expires", "Expires"), render: (c: any) => <span className="text-sm">{c.expires}</span> },
              { key: "actions", header: "", align: "right", render: (c: any) => (
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleToggle(c.id)} aria-label={t("admin.coupons.toggle", "Toggle coupon")}>
                    {c.status === "Active" ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(c.id, c.code)} aria-label={t("admin.coupons.delete", "Delete coupon")} className="text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button>
                </div>
              )},
            ]}
          />
        )}
      </DashboardCard>

      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.coupons.addCoupon", "Add Coupon")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.code", "Code")}</label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="SAVE20" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.discount", "Discount")}</label><Input value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="20%" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.type", "Type")}</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="Percentage">{t("admin.coupons.percentage", "Percentage")}</option><option value="Fixed">{t("admin.coupons.fixed", "Fixed")}</option></select></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.expiry", "Expires")}</label><Input type="date" value={formData.expires} onChange={(e) => setFormData({ ...formData, expires: e.target.value })} required /></div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.coupons.creating", "Creating...") : t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
