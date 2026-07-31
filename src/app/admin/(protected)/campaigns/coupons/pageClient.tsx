"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Ticket,
  Plus,
  Search,
  Trash2,
  Pencil,
  Loader2,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
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

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  campaignId?: string;
  campaignName?: string;
  usageCount: number;
  usageLimit: number;
  status: string;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
};

type CouponForm = {
  code: string;
  type: string;
  value: number;
  campaignId: string;
  usageLimit: number;
  status: string;
  startsAt: string;
  endsAt: string;
};

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "percentage",
  value: 0,
  campaignId: "",
  usageLimit: 0,
  status: "active",
  startsAt: "",
  endsAt: "",
};

const ITEMS_PER_PAGE = 10;

export function CouponsPageClient() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [campaignFilter, setCampaignFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Coupon | null>(null);
  const [form, setForm] = React.useState<CouponForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const { data: couponsData, error: couponsError, isLoading: couponsLoading, mutate } = useSWR("/api/admin/campaigns/coupons", fetcher, {
    revalidateOnFocus: false,
  });

  const { data: campaignsData } = useSWR("/api/admin/campaigns", fetcher, {
    revalidateOnFocus: false,
  });

  const coupons: Coupon[] = React.useMemo(() => {
    if (Array.isArray(couponsData?.data)) return couponsData.data;
    if (Array.isArray(couponsData)) return couponsData;
    return [];
  }, [couponsData]);

  const campaigns: Array<{ id: string; name: string }> = React.useMemo(() => {
    const raw = campaignsData?.data || campaignsData || [];
    return Array.isArray(raw) ? raw : [];
  }, [campaignsData]);

  const filtered = React.useMemo(() => {
    return coupons.filter((c) => {
      const matchSearch = !search || c.code?.toLowerCase().includes(search.toLowerCase());
      const matchCampaign = campaignFilter === "all" || c.campaignId === campaignFilter;
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchCampaign && matchStatus;
    });
  }, [coupons, search, campaignFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || "",
      type: coupon.type || "percentage",
      value: coupon.value || 0,
      campaignId: coupon.campaignId || "",
      usageLimit: coupon.usageLimit || 0,
      status: coupon.status || "active",
      startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : "",
      endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code) {
      toast.error(t("admin.error.missingFields"));
      return;
    }
    setSaving(true);
    try {
      const method = editingCoupon ? "PUT" : "POST";
      const url = editingCoupon ? `/api/admin/campaigns/coupons/${editingCoupon.id}` : "/api/admin/campaigns/coupons";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save coupon");
      toast.success(editingCoupon ? t("admin.couponUpdated", "Coupon updated") : t("admin.couponCreated", "Coupon created"));
      setDialogOpen(false);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/campaigns/coupons/${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete coupon");
      toast.success(t("admin.couponDeleted", "Coupon deleted"));
      setDeleteTarget(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  const statusTone = (status: string): "default" | "success" | "warning" | "info" | "muted" | "purple" => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "muted";
      case "expired":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("admin.campaigns"), href: "/admin/campaigns" },
            { label: t("admin.coupons") },
          ]}
        />
        <PageHeader
          title={t("admin.coupons")}
          description={t("admin.couponsDescription")}
          actions={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("admin.createCoupon")}
            </Button>
          }
        />

        <DashboardCard>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.searchCoupons", "Search coupons...")}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <select
                value={campaignFilter}
                onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("common.all")} {t("admin.campaigns")}</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("admin.allStatus")}</option>
                <option value="active">{t("admin.active")}</option>
                <option value="inactive">{t("admin.inactive")}</option>
                <option value="expired">{t("admin.expired", "Expired")}</option>
              </select>
            </div>

            {couponsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : couponsError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="size-12 text-destructive mb-4" />
                <p className="text-foreground font-medium">{t("common.error")}</p>
                <Button variant="outline" className="mt-4" onClick={() => mutate()}>{t("common.retry")}</Button>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Ticket className="size-12 text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">{t("admin.noCoupons")}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.couponCode")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.couponType")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.couponValue")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.campaigns")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.couponUsage")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.campaignStatus")}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((coupon) => (
                        <tr key={coupon.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-3 px-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{coupon.code}</code></td>
                          <td className="py-3 px-2">{coupon.type === "percentage" ? t("admin.percentageDiscount") : t("admin.fixedDiscount")}</td>
                          <td className="py-3 px-2">{coupon.type === "percentage" ? `${coupon.value}%` : coupon.value}</td>
                          <td className="py-3 px-2 text-muted-foreground">{coupon.campaignName || "—"}</td>
                          <td className="py-3 px-2">{coupon.usageCount} / {coupon.usageLimit || "∞"}</td>
                          <td className="py-3 px-2"><Badge tone={statusTone(coupon.status)}>{coupon.status}</Badge></td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(coupon)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(coupon)}>
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      {t("adminDataTable.showing", `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length}`)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="size-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DashboardCard>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-heading font-semibold">
                {editingCoupon ? t("admin.editCoupon", "Edit Coupon") : t("admin.createCoupon")}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.couponCode")}</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.couponType")}</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="percentage">{t("admin.percentageDiscount")}</option>
                    <option value="fixed">{t("admin.fixedDiscount")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.couponValue")}</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.campaigns")}</Label>
                <select value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">{t("common.none")}</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.usageLimit", "Usage Limit")}</Label>
                  <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.campaignStatus")}</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="active">{t("admin.active")}</option>
                    <option value="inactive">{t("admin.inactive")}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.startDate")}</Label>
                  <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.endDate")}</Label>
                  <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingCoupon ? t("common.update") : t("common.create")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md mx-4">
            <div className="p-6 text-center">
              <Trash2 className="size-12 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-heading font-semibold mb-2">{t("admin.deleteCoupon", "Delete Coupon")}</h2>
              <p className="text-muted-foreground text-sm">{t("admin.confirmDelete")}</p>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
