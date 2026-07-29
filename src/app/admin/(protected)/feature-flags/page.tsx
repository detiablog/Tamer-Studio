"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, ToggleLeft, ToggleRight, History, X, Loader } from "lucide-react";
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

export default function FeatureFlagsPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ key: "", name: "", description: "", status: "Enabled", rollout: "100%" });
  const [formLoading, setFormLoading] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/feature-flags", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const flags = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => flags.filter((f: any) => (f.key || "").toLowerCase().includes(search.toLowerCase()) || (f.name || "").toLowerCase().includes(search.toLowerCase())),
    [flags, search]
  );

  const handleToggle = async (id: string) => {
    const flag = flags.find((f: any) => f.id === id);
    const newEnabled = !(flag?.enabled ?? flag?.status === "Enabled");
    try {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle flag");
      toast.success(t("admin.featureFlags.toggled", "Feature flag toggled"));
      mutate();
    } catch {
      toast.error(t("admin.featureFlags.toggleFailed", "Failed to toggle feature flag"));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description,
          status: formData.status,
          rollout: formData.rollout,
        }),
      });
      if (!res.ok) throw new Error("Failed to create feature flag");
      setFormData({ key: "", name: "", description: "", status: "Enabled", rollout: "100%" });
      setAddOpen(false);
      toast.success(t("admin.featureFlags.created", "Feature flag created"));
      mutate();
    } catch {
      toast.error(t("admin.featureFlags.createFailed", "Failed to create feature flag"));
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.featureFlags", "Feature Flags") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.featureFlags", "Feature Flags")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.featureFlags.description", "Manage feature toggles and rollouts")}</p>
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
        <Breadcrumbs items={[{ label: t("admin.featureFlags", "Feature Flags") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.featureFlags", "Feature Flags")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.featureFlags.description", "Manage feature toggles and rollouts")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.featureFlags", "Feature Flags") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.featureFlags", "Feature Flags")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.featureFlags.description", "Manage feature toggles and rollouts")}</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 size-4" />{t("admin.featureFlags.addFlag", "Add Flag")}</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.featureFlags.search", "Search flags...")} className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.featureFlags.noFlags", "No feature flags found")}
          </div>
        ) : (
          <AdminDataTable
            data={filtered}
            keyExtractor={(f) => f.id}
            columns={[
              { key: "key", header: t("admin.featureFlags.key", "Key"), render: (f: any) => <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{f.key}</code> },
              { key: "name", header: t("common.name", "Name"), render: (f: any) => <span className="font-medium text-sm">{f.name || f.key}</span> },
              { key: "status", header: t("common.status", "Status"), render: (f: any) => <Badge tone={(f.enabled ?? f.status === "Enabled") ? "success" : "muted"}>{(f.enabled ?? f.status === "Enabled") ? "Enabled" : "Disabled"}</Badge> },
              { key: "rollout", header: t("admin.featureFlags.rollout", "Rollout"), render: (f: any) => {
                const rollout = f.rollout || `${f.rolloutPercentage ?? 0}%`;
                return <div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40"><div className="h-full rounded-full bg-primary transition-all" style={{ width: rollout }} /></div><span className="text-xs">{rollout}</span></div>;
              }},
              { key: "lastModified", header: t("admin.featureFlags.lastModified", "Last Modified"), render: (f: any) => <span className="text-xs text-muted-foreground">{f.lastModified || f.updatedAt || ""}</span> },
              { key: "actions", header: "", align: "right", render: (f: any) => (
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleToggle(f.id)} aria-label={t("admin.featureFlags.toggleFlag", "Toggle flag")}>
                    {(f.enabled ?? f.status === "Enabled") ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4 text-muted-foreground" />}
                  </Button>
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
              <h2 className="text-xl font-semibold">{t("admin.featureFlags.addFlag", "Add Feature Flag")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.featureFlags.key", "Key")}</label><Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="feature_key" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Feature Name" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("common.description", "Description")}</label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" /></div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.creating", "Creating...") : t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
