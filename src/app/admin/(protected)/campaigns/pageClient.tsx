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
  Megaphone,
  Plus,
  Search,
  Trash2,
  Pencil,
  Archive,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  Calendar,
  Ticket,
  Clock,
  AlertTriangle,
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
  priority: number;
  startsAt: string;
  endsAt: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  maxUses?: number;
  usedCount?: number;
  isActive?: boolean;
  createdAt?: string;
};

type CampaignForm = {
  name: string;
  code: string;
  type: string;
  status: string;
  priority: number;
  startsAt: string;
  endsAt: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxUses: number;
};

const CAMPAIGN_TYPES = [
  "flash_sale",
  "coupon",
  "voucher",
  "referral",
  "affiliate",
  "holiday",
  "seasonal",
  "bundle",
  "first_purchase",
  "loyalty",
  "free_credits",
  "subscription",
  "limited_time",
] as const;

const CAMPAIGN_STATUSES = ["active", "scheduled", "expired", "archived", "disabled"] as const;

const EMPTY_FORM: CampaignForm = {
  name: "",
  code: "",
  type: "coupon",
  status: "active",
  priority: 0,
  startsAt: "",
  endsAt: "",
  description: "",
  discountType: "percentage",
  discountValue: 0,
  maxUses: 0,
};

const ITEMS_PER_PAGE = 10;

export function CampaignsPageClient() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCampaign, setEditingCampaign] = React.useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Campaign | null>(null);
  const [form, setForm] = React.useState<CampaignForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/campaigns", fetcher, {
    revalidateOnFocus: false,
  });

  const campaigns: Campaign[] = React.useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const filtered = React.useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchType = typeFilter === "all" || c.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [campaigns, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = React.useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active").length;
    const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
    const expired = campaigns.filter((c) => c.status === "expired").length;
    const totalCoupons = campaigns.reduce((sum, c) => sum + (c.maxUses || 0), 0);
    const usedCoupons = campaigns.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    return { active, scheduled, expired, totalCoupons, usedCoupons };
  }, [campaigns]);

  const openCreate = () => {
    setEditingCampaign(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name || "",
      code: campaign.code || "",
      type: campaign.type || "coupon",
      status: campaign.status || "active",
      priority: campaign.priority || 0,
      startsAt: campaign.startsAt ? campaign.startsAt.slice(0, 16) : "",
      endsAt: campaign.endsAt ? campaign.endsAt.slice(0, 16) : "",
      description: campaign.description || "",
      discountType: campaign.discountType || "percentage",
      discountValue: campaign.discountValue || 0,
      maxUses: campaign.maxUses || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast.error(t("admin.error.missingFields"));
      return;
    }
    setSaving(true);
    try {
      const method = editingCampaign ? "PUT" : "POST";
      const url = editingCampaign ? `/api/admin/campaigns/${editingCampaign.id}` : "/api/admin/campaigns";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save campaign");
      toast.success(editingCampaign ? t("admin.campaignUpdated", "Campaign updated") : t("admin.campaignCreated", "Campaign created"));
      setDialogOpen(false);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete campaign");
      toast.success(t("admin.campaignDeleted", "Campaign deleted"));
      setDeleteTarget(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete campaign");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((c) => c.id)));
    }
  };

  const bulkAction = async (action: "enable" | "disable" | "archive" | "delete") => {
    if (selectedIds.size === 0) return;
    if (action === "delete" && !confirm(t("admin.confirmDelete"))) return;
    try {
      const res = await fetch("/api/admin/campaigns/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Bulk action failed");
      toast.success(t("admin.bulkActionCompleted", "Bulk action completed"));
      setSelectedIds(new Set());
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk action failed");
    }
  };

  const statusTone = (status: string): "default" | "success" | "warning" | "info" | "muted" | "purple" => {
    switch (status) {
      case "active":
        return "success";
      case "scheduled":
        return "info";
      case "expired":
        return "warning";
      case "archived":
        return "muted";
      case "disabled":
        return "muted";
      default:
        return "default";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("admin.campaigns"), href: "/admin/campaigns" },
          ]}
        />
        <PageHeader
          title={t("admin.campaigns")}
          description={t("admin.campaignsDescription")}
          actions={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("admin.createCampaign")}
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Megaphone className="size-4" />
              {t("admin.activeCampaigns")}
            </div>
            <div className="text-2xl font-semibold">{stats.active}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="size-4" />
              {t("admin.scheduledCampaigns")}
            </div>
            <div className="text-2xl font-semibold">{stats.scheduled}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className="size-4" />
              {t("admin.expiredCampaigns")}
            </div>
            <div className="text-2xl font-semibold">{stats.expired}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Ticket className="size-4" />
              {t("admin.totalCoupons")}
            </div>
            <div className="text-2xl font-semibold">{stats.totalCoupons}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckSquare className="size-4" />
              {t("admin.usedCoupons")}
            </div>
            <div className="text-2xl font-semibold">{stats.usedCoupons}</div>
          </DashboardCard>
        </div>

        <DashboardCard>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.searchCampaigns", "Search campaigns...")}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("admin.allStatus")}</option>
                {CAMPAIGN_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("common.all")}</option>
                {CAMPAIGN_TYPES.map((tp) => (
                  <option key={tp} value={tp}>{t(`admin.campaignTypes.${tp}`, tp)}</option>
                ))}
              </select>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                <Button variant="outline" size="sm" onClick={() => bulkAction("enable")}>{t("admin.enable")}</Button>
                <Button variant="outline" size="sm" onClick={() => bulkAction("disable")}>{t("admin.disable")}</Button>
                <Button variant="outline" size="sm" onClick={() => bulkAction("archive")}>{t("admin.archive", "Archive")}</Button>
                <Button variant="destructive" size="sm" onClick={() => bulkAction("delete")}>{t("admin.delete")}</Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="size-12 text-destructive mb-4" />
                <p className="text-foreground font-medium">{t("common.error")}</p>
                <Button variant="outline" className="mt-4" onClick={() => mutate()}>{t("common.retry")}</Button>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="size-12 text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">{t("admin.noCampaigns")}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2">
                          <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground">
                            {selectedIds.size === paginated.length && paginated.length > 0 ? (
                              <CheckSquare className="size-4" />
                            ) : (
                              <Square className="size-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.campaignName")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.campaignCode")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.campaignType")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.campaignStatus")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.priority")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.startDate")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.endDate")}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-3 px-2">
                            <button onClick={() => toggleSelect(campaign.id)} className="text-muted-foreground hover:text-foreground">
                              {selectedIds.has(campaign.id) ? (
                                <CheckSquare className="size-4" />
                              ) : (
                                <Square className="size-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-2 font-medium">{campaign.name}</td>
                          <td className="py-3 px-2"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{campaign.code}</code></td>
                          <td className="py-3 px-2">{t(`admin.campaignTypes.${campaign.type}`, campaign.type)}</td>
                          <td className="py-3 px-2"><Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge></td>
                          <td className="py-3 px-2">{campaign.priority}</td>
                          <td className="py-3 px-2">{formatDate(campaign.startsAt)}</td>
                          <td className="py-3 px-2">{formatDate(campaign.endsAt)}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(campaign)}>
                                <Pencil className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(campaign)}>
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
                {editingCampaign ? t("admin.editCampaign") : t("admin.createCampaign")}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.campaignName")}</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.campaignCode")}</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.campaignType")}</Label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {CAMPAIGN_TYPES.map((tp) => (
                      <option key={tp} value={tp}>{t(`admin.campaignTypes.${tp}`, tp)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.campaignStatus")}</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {CAMPAIGN_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.priority")}</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("common.description")}</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.discountType", "Discount Type")}</Label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="percentage">{t("admin.percentageDiscount")}</option>
                    <option value="fixed">{t("admin.fixedDiscount")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.discountValue", "Discount Value")}</Label>
                  <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.maxUses", "Max Uses")}</Label>
                <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingCampaign ? t("common.update") : t("common.create")}
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
              <h2 className="text-lg font-heading font-semibold mb-2">{t("admin.deleteCampaign")}</h2>
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
