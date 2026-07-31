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
import {
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Loader,
  X,
  DollarSign,
  Package,
  Globe,
  Calculator,
  TrendingUp,
  History,
  Settings,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });

const CATEGORIES = [
  { value: "subscription", nameKey: "admin.pricing.pricingCategories.subscription" },
  { value: "credit_package", nameKey: "admin.pricing.pricingCategories.credit_package" },
  { value: "one_time", nameKey: "admin.pricing.pricingCategories.one_time" },
  { value: "recurring", nameKey: "admin.pricing.pricingCategories.recurring" },
  { value: "ai_credits", nameKey: "admin.pricing.pricingCategories.ai_credits" },
  { value: "storage", nameKey: "admin.pricing.pricingCategories.storage" },
];

const STATUSES = [
  { value: "draft", nameKey: "admin.pricing.pricingStatuses.draft", tone: "muted" as const },
  { value: "active", nameKey: "admin.pricing.pricingStatuses.active", tone: "success" as const },
  { value: "scheduled", nameKey: "admin.pricing.pricingStatuses.scheduled", tone: "info" as const },
  { value: "expired", nameKey: "admin.pricing.pricingStatuses.expired", tone: "warning" as const },
  { value: "archived", nameKey: "admin.pricing.pricingStatuses.archived", tone: "muted" as const },
  { value: "disabled", nameKey: "admin.pricing.pricingStatuses.disabled", tone: "muted" as const },
];

const TYPES = ["fixed", "tiered", "volume", "dynamic"];

interface PricingItem {
  id: string;
  name: string;
  code: string;
  slug?: string;
  category: string;
  type: string;
  basePrice: number;
  salePrice?: number;
  currency: string;
  status: string;
  description?: string;
  features?: string[];
  credits?: number;
  region?: string;
  country?: string;
  taxRate?: number;
  fee?: number;
  version?: number;
  versions?: Array<{ version: number; price: number; changedAt: string; changedBy: string }>;
  createdAt?: string;
  updatedAt?: string;
}

interface PricingForm {
  name: string;
  code: string;
  slug: string;
  category: string;
  type: string;
  basePrice: number;
  salePrice: number;
  currency: string;
  status: string;
  description: string;
  credits: number;
  region: string;
  country: string;
  taxRate: number;
  fee: number;
}

const emptyForm: PricingForm = {
  name: "",
  code: "",
  slug: "",
  category: "subscription",
  type: "fixed",
  basePrice: 0,
  salePrice: 0,
  currency: "USD",
  status: "draft",
  description: "",
  credits: 0,
  region: "",
  country: "",
  taxRate: 0,
  fee: 0,
};

interface SimulatorInput {
  pricingItemId: string;
  country: string;
  campaignCode: string;
  couponCode: string;
}

interface SimulatorResult {
  basePrice: number;
  regionalOverride?: number;
  campaignDiscount?: number;
  couponDiscount?: number;
  tax?: number;
  fee?: number;
  finalPrice: number;
  breakdown: Array<{ label: string; amount: number; running: number }>;
}

export default function PricingPageClient() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [search, setSearch] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterType, setFilterType] = React.useState("all");
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PricingItem | null>(null);
  const [form, setForm] = React.useState<PricingForm>(emptyForm);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("items");
  const [selectedForBulk, setSelectedForBulk] = React.useState<Set<string>>(new Set());
  const [simulatorInput, setSimulatorInput] = React.useState<SimulatorInput>({
    pricingItemId: "",
    country: "",
    campaignCode: "",
    couponCode: "",
  });
  const [simulatorResult, setSimulatorResult] = React.useState<SimulatorResult | null>(null);
  const [simulating, setSimulating] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/pricing", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const items: PricingItem[] = React.useMemo(() => {
    if (data?.success) {
      if (Array.isArray(data.data)) return data.data;
      if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;
    }
    return [];
  }, [data]);

  const filtered = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.code?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesCategory && matchesStatus && matchesType;
    });
  }, [items, search, filterCategory, filterStatus, filterType]);

  const stats = React.useMemo(() => {
    const activePlans = items.filter((i) => i.status === "active" && i.category === "subscription");
    const creditPkgs = items.filter((i) => i.category === "credit_package");
    const regions = new Set(items.map((i) => i.region).filter(Boolean));
    const avgPrice =
      activePlans.length > 0
        ? activePlans.reduce((sum, i) => sum + (i.salePrice || i.basePrice), 0) / activePlans.length
        : 0;
    return {
      totalPlans: items.length,
      activePlans: activePlans.length,
      creditPackages: creditPkgs.length,
      regionalRules: regions.size,
      avgPrice,
    };
  }, [items]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingItem(null);
    setShowCreateDialog(true);
  };

  const openEdit = (item: PricingItem) => {
    setForm({
      name: item.name || "",
      code: item.code || "",
      slug: item.slug || "",
      category: item.category || "subscription",
      type: item.type || "fixed",
      basePrice: item.basePrice || 0,
      salePrice: item.salePrice || 0,
      currency: item.currency || "USD",
      status: item.status || "draft",
      description: item.description || "",
      credits: item.credits || 0,
      region: item.region || "",
      country: item.country || "",
      taxRate: item.taxRate || 0,
      fee: item.fee || 0,
    });
    setEditingItem(item);
    setShowCreateDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast.error(t("admin.error.missingFields", "Please fill in all required fields"));
      return;
    }
    setSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/pricing/${editingItem.id}`
        : "/api/admin/pricing";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(
        editingItem
          ? t("admin.pricing.pricingUpdated", "Pricing item updated")
          : t("admin.pricing.pricingCreated", "Pricing item created")
      );
      setShowCreateDialog(false);
      setEditingItem(null);
      setForm(emptyForm);
      mutate();
    } catch {
      toast.error(
        editingItem
          ? t("admin.pricing.updateFailed", "Failed to update pricing item")
          : t("admin.pricing.createFailed", "Failed to create pricing item")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.pricing.deleteConfirm", "Delete this pricing item?"))) return;
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("admin.pricing.deleted", "Pricing item deleted"));
      mutate();
    } catch {
      toast.error(t("admin.pricing.deleteFailed", "Failed to delete pricing item"));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedForBulk.size === 0) return;
    if (!confirm(t("admin.pricing.bulkDeleteConfirm", "Delete {0} selected items?").replace("{0}", String(selectedForBulk.size)))) return;
    try {
      await Promise.all(
        Array.from(selectedForBulk).map((id) =>
          fetch(`/api/admin/pricing/${id}`, { method: "DELETE", credentials: "include" })
        )
      );
      toast.success(t("admin.pricing.bulkDeleted", "Selected items deleted"));
      setSelectedForBulk(new Set());
      mutate();
    } catch {
      toast.error(t("admin.pricing.bulkDeleteFailed", "Failed to delete items"));
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedForBulk.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedForBulk).map((id) =>
          fetch(`/api/admin/pricing/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status }),
          })
        )
      );
      toast.success(t("admin.pricing.statusUpdated", "Status updated for selected items"));
      setSelectedForBulk(new Set());
      mutate();
    } catch {
      toast.error(t("admin.pricing.statusUpdateFailed", "Failed to update status"));
    }
  };

  const handleSimulate = async () => {
    if (!simulatorInput.pricingItemId) {
      toast.error(t("admin.pricing.selectItem", "Please select a pricing item"));
      return;
    }
    setSimulating(true);
    setSimulatorResult(null);
    try {
      const res = await fetch("/api/admin/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(simulatorInput),
      });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      setSimulatorResult(result.data || result);
    } catch {
      toast.error(t("admin.pricing.simulateFailed", "Failed to simulate price"));
    } finally {
      setSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.pricing", "Pricing") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.pricing.pricingEngine", "Pricing Engine")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.pricing.pricingDescription", "Manage pricing plans, credits, and regional rules")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.pricing", "Pricing") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.pricing.pricingEngine", "Pricing Engine")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.pricing.pricingDescription", "Manage pricing plans, credits, and regional rules")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />{t("common.refresh", "Refresh")}
            </Button>
            <Button size="sm" onClick={openCreate} className="gap-2">
              <Plus className="size-4" />{t("admin.pricing.createPricingItem", "Create Pricing Item")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.pricing.totalPlans", "Total Plans")}</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalPlans}</p>
          </div>
          <div className="rounded-lg border bg-green-500/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-green-600" />
              <p className="text-xs text-muted-foreground">{t("admin.pricing.activePlans", "Active Plans")}</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activePlans}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.pricing.creditPackages", "Credit Packages")}</p>
            </div>
            <p className="text-2xl font-bold">{stats.creditPackages}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.pricing.regionalRules", "Regional Rules")}</p>
            </div>
            <p className="text-2xl font-bold">{stats.regionalRules}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.pricing.avgPlanPrice", "Avg Plan Price")}</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.avgPrice)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          <Button variant={activeTab === "items" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("items")}>
            {t("admin.pricing.pricingItems", "Pricing Items")}
          </Button>
          <Button variant={activeTab === "regions" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("regions")}>
            {t("admin.pricing.pricingRegions", "Regional Pricing")}
          </Button>
          <Button variant={activeTab === "tax" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("tax")}>
            {t("admin.pricing.taxConfiguration", "Tax & Fee")}
          </Button>
          <Button variant={activeTab === "simulator" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("simulator")}>
            {t("admin.pricing.pricingSimulator", "Pricing Simulator")}
          </Button>
        </div>

        {activeTab === "items" && (
          <>
            <div className="flex items-center gap-2 pb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("admin.pricing.searchPricing", "Search pricing items...")}
                  className="pl-9"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-8 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="all">{t("common.all", "All")}</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{t(c.nameKey)}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="all">{t("common.all", "All")}</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{t(s.nameKey)}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-8 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="all">{t("common.all", "All")}</option>
                {TYPES.map((ty) => (
                  <option key={ty} value={ty}>{ty}</option>
                ))}
              </select>
            </div>

            {selectedForBulk.size > 0 && (
              <div className="flex items-center gap-2 pb-3 text-sm text-muted-foreground">
                <span>{selectedForBulk.size} {t("common.selected", "selected")}</span>
                <Button variant="ghost" size="sm" onClick={() => handleBulkStatusChange("active")}>
                  {t("admin.pricing.activate", "Activate")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleBulkStatusChange("disabled")}>
                  {t("admin.pricing.disable", "Disable")}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="text-destructive">
                  {t("common.delete", "Delete")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedForBulk(new Set())}>
                  {t("common.cancel", "Cancel")}
                </Button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {t("admin.pricing.noItems", "No pricing items found")}
              </div>
            ) : (
              <AdminDataTable
                data={filtered}
                keyExtractor={(item) => item.id}
                columns={[
                  {
                    key: "name",
                    header: t("admin.pricing.pricingName", "Name"),
                    render: (item: PricingItem) => (
                      <div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="block text-xs text-muted-foreground">{item.code}</span>
                      </div>
                    ),
                  },
                  {
                    key: "category",
                    header: t("admin.pricing.pricingCategory", "Category"),
                    render: (item: PricingItem) => (
                      <Badge tone="purple">{item.category}</Badge>
                    ),
                  },
                  {
                    key: "type",
                    header: t("admin.pricing.pricingType", "Type"),
                    render: (item: PricingItem) => (
                      <span className="text-sm capitalize">{item.type}</span>
                    ),
                  },
                  {
                    key: "basePrice",
                    header: t("admin.pricing.basePrice", "Base Price"),
                    render: (item: PricingItem) => (
                      <span className="font-medium text-sm">{formatCurrency(item.basePrice)}</span>
                    ),
                  },
                  {
                    key: "salePrice",
                    header: t("admin.pricing.salePrice", "Sale Price"),
                    render: (item: PricingItem) => (
                      <span className={`text-sm ${item.salePrice ? "line-through text-muted-foreground" : ""}`}>
                        {item.salePrice ? formatCurrency(item.salePrice) : "-"}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: t("admin.pricing.pricingStatus", "Status"),
                    render: (item: PricingItem) => {
                      const statusDef = STATUSES.find((s) => s.value === item.status);
                      return <Badge tone={statusDef?.tone || "muted"}>{item.status}</Badge>;
                    },
                  },
                  {
                    key: "actions",
                    header: "",
                    align: "right",
                    render: (item: PricingItem) => (
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="text-xs">
                          {t("common.edit", "Edit")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-destructive text-xs">
                          {t("common.delete", "Delete")}
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </>
        )}

        {activeTab === "regions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("admin.pricing.regionalPricingDesc", "Manage regional price overrides for different countries and regions")}</p>
              <Button size="sm" variant="outline"><Plus className="mr-2 size-4" />{t("admin.pricing.addRegionalRule", "Add Regional Rule")}</Button>
            </div>
            {(() => {
              const regionItems = items.filter((i) => i.region || i.country);
              if (regionItems.length === 0) {
                return (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    <Globe className="size-8 mx-auto mb-2 opacity-40" />
                    <p>{t("admin.pricing.noRegionalRules", "No regional pricing rules configured")}</p>
                  </div>
                );
              }
              return (
                <AdminDataTable
                  data={regionItems}
                  keyExtractor={(item) => item.id}
                  columns={[
                    { key: "name", header: t("admin.pricing.pricingName", "Name"), render: (item: PricingItem) => <span className="text-sm font-medium">{item.name}</span> },
                    { key: "region", header: t("admin.pricing.pricingRegion", "Region"), render: (item: PricingItem) => <span className="text-sm">{item.region || "-"}</span> },
                    { key: "country", header: t("admin.pricing.pricingCountry", "Country"), render: (item: PricingItem) => <span className="text-sm">{item.country || "-"}</span> },
                    { key: "basePrice", header: t("admin.pricing.basePrice", "Base Price"), render: (item: PricingItem) => <span className="text-sm">{formatCurrency(item.basePrice)}</span> },
                    { key: "currency", header: t("admin.pricing.pricingCurrency", "Currency"), render: (item: PricingItem) => <Badge>{item.currency}</Badge> },
                  ]}
                />
              );
            })()}
          </div>
        )}

        {activeTab === "tax" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="size-5 text-muted-foreground" />
                  <h3 className="font-semibold">{t("admin.pricing.taxConfiguration", "Tax Configuration")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t("admin.pricing.taxConfigDesc", "Configure default tax rates applied to pricing items")}</p>
                <div className="space-y-3">
                  <div>
                    <Label>{t("admin.pricing.defaultTaxRate", "Default Tax Rate (%)")}</Label>
                    <Input type="number" defaultValue="0" className="mt-1" placeholder="0" />
                  </div>
                  <div>
                    <Label>{t("admin.pricing.taxInclusive", "Tax Inclusive")}</Label>
                    <select className="w-full mt-1 h-8 rounded-lg border bg-background px-3 text-sm">
                      <option value="exclusive">{t("admin.pricing.taxExclusive", "Tax Exclusive (added on top)")}</option>
                      <option value="inclusive">{t("admin.pricing.taxInclusiveOpt", "Tax Inclusive (included in price)")}</option>
                    </select>
                  </div>
                  <Button size="sm">{t("common.save", "Save")}</Button>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-5 text-muted-foreground" />
                  <h3 className="font-semibold">{t("admin.pricing.feeConfiguration", "Fee Configuration")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t("admin.pricing.feeConfigDesc", "Configure platform fees applied to transactions")}</p>
                <div className="space-y-3">
                  <div>
                    <Label>{t("admin.pricing.platformFee", "Platform Fee (%)")}</Label>
                    <Input type="number" defaultValue="0" className="mt-1" placeholder="0" />
                  </div>
                  <div>
                    <Label>{t("admin.pricing.processingFee", "Processing Fee (fixed)")}</Label>
                    <Input type="number" defaultValue="0" className="mt-1" placeholder="0" />
                  </div>
                  <Button size="sm">{t("common.save", "Save")}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "simulator" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calculator className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("admin.pricing.pricingSimulator", "Pricing Simulator")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t("admin.pricing.simulatorDesc", "Test how pricing is calculated with different inputs and rules")}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("admin.pricing.pricingItem", "Pricing Item")}</Label>
                <select
                  value={simulatorInput.pricingItemId}
                  onChange={(e) => setSimulatorInput({ ...simulatorInput, pricingItemId: e.target.value })}
                  className="w-full mt-1 h-8 rounded-lg border bg-background px-3 text-sm"
                >
                  <option value="">{t("admin.pricing.selectItem", "Select a pricing item")}</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t("admin.pricing.pricingCountry", "Country")}</Label>
                <Input
                  value={simulatorInput.country}
                  onChange={(e) => setSimulatorInput({ ...simulatorInput, country: e.target.value })}
                  placeholder={t("admin.pricing.countryPlaceholder", "e.g. US, ID, JP")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("admin.pricing.campaignCode", "Campaign Code")}</Label>
                <Input
                  value={simulatorInput.campaignCode}
                  onChange={(e) => setSimulatorInput({ ...simulatorInput, campaignCode: e.target.value })}
                  placeholder={t("admin.pricing.optional", "Optional")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("admin.pricing.couponCode", "Coupon Code")}</Label>
                <Input
                  value={simulatorInput.couponCode}
                  onChange={(e) => setSimulatorInput({ ...simulatorInput, couponCode: e.target.value })}
                  placeholder={t("admin.pricing.optional", "Optional")}
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleSimulate} disabled={simulating} className="gap-2">
              {simulating ? <Loader className="size-4 animate-spin" /> : <Calculator className="size-4" />}
              {t("admin.pricing.simulatePrice", "Simulate Price")}
            </Button>

            {simulatorResult && (
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <ArrowRight className="size-4" />
                  {t("admin.pricing.calculationBreakdown", "Calculation Breakdown")}
                </h4>
                <div className="space-y-2">
                  {simulatorResult.breakdown?.map((step, index) => (
                    <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{step.label}</span>
                      <div className="flex items-center gap-4">
                        <span>{formatCurrency(step.amount)}</span>
                        <span className="font-medium">{formatCurrency(step.running)}</span>
                      </div>
                    </div>
                  ))}
                  {!simulatorResult.breakdown && (
                    <>
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="text-muted-foreground">{t("admin.pricing.basePrice", "Base Price")}</span>
                        <span className="font-medium">{formatCurrency(simulatorResult.basePrice)}</span>
                      </div>
                      {simulatorResult.regionalOverride != null && (
                        <div className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{t("admin.pricing.regionalOverride", "Regional Override")}</span>
                          <span className="font-medium">{formatCurrency(simulatorResult.regionalOverride)}</span>
                        </div>
                      )}
                      {simulatorResult.campaignDiscount != null && simulatorResult.campaignDiscount > 0 && (
                        <div className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{t("admin.pricing.campaignDiscount", "Campaign Discount")}</span>
                          <span className="font-medium text-green-600">-{formatCurrency(simulatorResult.campaignDiscount)}</span>
                        </div>
                      )}
                      {simulatorResult.couponDiscount != null && simulatorResult.couponDiscount > 0 && (
                        <div className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{t("admin.pricing.couponDiscount", "Coupon Discount")}</span>
                          <span className="font-medium text-green-600">-{formatCurrency(simulatorResult.couponDiscount)}</span>
                        </div>
                      )}
                      {simulatorResult.tax != null && simulatorResult.tax > 0 && (
                        <div className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{t("admin.pricing.tax", "Tax")}</span>
                          <span className="font-medium">+{formatCurrency(simulatorResult.tax)}</span>
                        </div>
                      )}
                      {simulatorResult.fee != null && simulatorResult.fee > 0 && (
                        <div className="flex items-center justify-between text-sm py-1">
                          <span className="text-muted-foreground">{t("admin.pricing.fee", "Fee")}</span>
                          <span className="font-medium">+{formatCurrency(simulatorResult.fee)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between text-sm py-2 border-t border-border font-semibold">
                    <span>{t("admin.pricing.finalPrice", "Final Price")}</span>
                    <span className="text-lg">{formatCurrency(simulatorResult.finalPrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardCard>

      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem
                  ? t("admin.pricing.editPricingItem", "Edit Pricing Item")
                  : t("admin.pricing.createPricingItem", "Create Pricing Item")}
              </h2>
              <button onClick={() => { setShowCreateDialog(false); setEditingItem(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("admin.pricing.pricingName", "Name")} *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder={t("admin.pricing.namePlaceholder", "e.g. Creator Plan")} />
              </div>
              <div>
                <Label>{t("admin.pricing.pricingCode", "Code")} *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1" placeholder={t("admin.pricing.codePlaceholder", "e.g. creator_monthly")} />
              </div>
              <div>
                <Label>{t("admin.pricing.pricingSlug", "Slug")}</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" placeholder={t("admin.pricing.slugPlaceholder", "auto-generated")} />
              </div>
              <div>
                <Label>{t("admin.pricing.pricingCategory", "Category")}</Label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 h-8 rounded-lg border bg-background px-3 text-sm">
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{t(c.nameKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t("admin.pricing.pricingType", "Type")}</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 h-8 rounded-lg border bg-background px-3 text-sm">
                  {TYPES.map((ty) => (
                    <option key={ty} value={ty}>{ty}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t("admin.pricing.pricingStatus", "Status")}</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 h-8 rounded-lg border bg-background px-3 text-sm">
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{t(s.nameKey)}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{t("admin.pricing.basePrice", "Base Price")}</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>{t("admin.pricing.salePrice", "Sale Price")}</Label>
                <Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>{t("admin.pricing.pricingCurrency", "Currency")}</Label>
                <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1" placeholder="USD" />
              </div>
              <div>
                <Label>{t("admin.pricing.credits", "Credits")}</Label>
                <Input type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>{t("admin.pricing.pricingRegion", "Region")}</Label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="mt-1" placeholder={t("admin.pricing.regionPlaceholder", "e.g. SEA, EU")} />
              </div>
              <div>
                <Label>{t("admin.pricing.pricingCountry", "Country")}</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1" placeholder={t("admin.pricing.countryPlaceholder2", "e.g. US, ID")} />
              </div>
              <div>
                <Label>{t("admin.pricing.taxRate", "Tax Rate (%)")}</Label>
                <Input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
              <div>
                <Label>{t("admin.pricing.fee", "Fee")}</Label>
                <Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: parseFloat(e.target.value) || 0 })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>{t("admin.pricing.description", "Description")}</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]"
                placeholder={t("admin.pricing.descriptionPlaceholder", "Optional description")}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingItem(null); }}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving && <Loader className="size-4 animate-spin" />}
                {editingItem ? t("common.update", "Update") : t("common.create", "Create")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
