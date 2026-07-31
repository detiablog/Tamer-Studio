"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  RefreshCw,
  Loader,
  Activity,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Shield,
  Flag,
  GitBranch,
  Settings,
  ScrollText,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Server,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Power,
  PowerOff,
} from "lucide-react";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type TabId =
  | "overview"
  | "providers"
  | "models"
  | "flags"
  | "routing"
  | "safety"
  | "settings"
  | "audit";

const TABS: { id: TabId; labelKey: string; icon: React.ReactNode }[] = [
  { id: "overview", labelKey: "admin.aiAdmin", icon: <Brain className="size-4" /> },
  { id: "providers", labelKey: "admin.aiRuntime.providers", icon: <Server className="size-4" /> },
  { id: "models", labelKey: "admin.aiRuntime.models", icon: <Zap className="size-4" /> },
  { id: "flags", labelKey: "admin.featureFlags.label", icon: <Flag className="size-4" /> },
  { id: "routing", labelKey: "admin.routingRules", icon: <GitBranch className="size-4" /> },
  { id: "safety", labelKey: "admin.safetyPolicies", icon: <Shield className="size-4" /> },
  { id: "settings", labelKey: "admin.runtimeSettings", icon: <Settings className="size-4" /> },
  { id: "audit", labelKey: "admin.adminActions", icon: <ScrollText className="size-4" /> },
];

export function AIAdminPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<TabId>("overview");
  const [providerFilter, setProviderFilter] = React.useState("");
  const [editProvider, setEditProvider] = React.useState<any>(null);
  const [providerForm, setProviderForm] = React.useState({
    displayName: "",
    apiKey: "",
    region: "",
    priority: "1",
    timeout: "30000",
    retry: "3",
    rateLimit: "100",
    status: "active",
  });
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [createFlagOpen, setCreateFlagOpen] = React.useState(false);
  const [flagForm, setFlagForm] = React.useState({ name: "", category: "", description: "", enabled: true });
  const [createRuleOpen, setCreateRuleOpen] = React.useState(false);
  const [ruleForm, setRuleForm] = React.useState({ name: "", priority: "1", targetProvider: "", targetModel: "", active: true });
  const [editRule, setEditRule] = React.useState<any>(null);
  const [createPolicyOpen, setCreatePolicyOpen] = React.useState(false);
  const [policyForm, setPolicyForm] = React.useState({ name: "", type: "content_filter", severity: "medium", enabled: true, rules: "" });
  const [editPolicy, setEditPolicy] = React.useState<any>(null);
  const [settingEdit, setSettingEdit] = React.useState<{ key: string; value: string } | null>(null);
  const [newSettingKey, setNewSettingKey] = React.useState("");
  const [newSettingValue, setNewSettingValue] = React.useState("");
  const [addSettingOpen, setAddSettingOpen] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/admin/ai/stats", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: providersData, isLoading: providersLoading, mutate: mutateProviders } = useSWR("/api/admin/ai/config/providers", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: flagsData, isLoading: flagsLoading, mutate: mutateFlags } = useSWR("/api/admin/ai/config/flags", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: routingData, isLoading: routingLoading, mutate: mutateRouting } = useSWR("/api/admin/ai/config/routing", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/admin/ai/config/settings", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: safetyData, isLoading: safetyLoading, mutate: mutateSafety } = useSWR("/api/admin/ai/config/safety", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: actionsData, isLoading: actionsLoading, mutate: mutateActions } = useSWR("/api/admin/ai/config/actions", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const stats = React.useMemo(() => {
    if (statsData?.success && statsData.data) return statsData.data;
    return {
      totalProviders: 0,
      enabledProviders: 0,
      totalModels: 0,
      activeFlags: 0,
      routingRules: 0,
      safetyPolicies: 0,
      recentActions: [],
      providerHealth: [],
    };
  }, [statsData]);

  const providers = React.useMemo(() => {
    if (providersData?.success && Array.isArray(providersData.data)) return providersData.data;
    return [];
  }, [providersData]);

  const flags = React.useMemo(() => {
    if (flagsData?.success && Array.isArray(flagsData.data)) return flagsData.data;
    return [];
  }, [flagsData]);

  const routingRules = React.useMemo(() => {
    if (routingData?.success && Array.isArray(routingData.data)) return routingData.data;
    return [];
  }, [routingData]);

  const settings = React.useMemo(() => {
    if (settingsData?.success && settingsData.data) return settingsData.data;
    return {};
  }, [settingsData]);

  const safetyPolicies = React.useMemo(() => {
    if (safetyData?.success && Array.isArray(safetyData.data)) return safetyData.data;
    return [];
  }, [safetyData]);

  const adminActions = React.useMemo(() => {
    if (actionsData?.success && Array.isArray(actionsData.data)) return actionsData.data;
    return [];
  }, [actionsData]);

  const filteredProviders = React.useMemo(
    () =>
      providers.filter((p: any) =>
        (p.name || p.displayName || "").toLowerCase().includes(providerFilter.toLowerCase())
      ),
    [providers, providerFilter]
  );

  const filteredModels = React.useMemo(() => {
    if (!providerFilter) return providers.flatMap((p: any) => (p.models || []).map((m: any) => ({ ...m, provider: p.name || p.displayName })));
    return providers
      .filter((p: any) => (p.name || p.displayName || "").toLowerCase().includes(providerFilter.toLowerCase()))
      .flatMap((p: any) => (p.models || []).map((m: any) => ({ ...m, provider: p.name || p.displayName })));
  }, [providers, providerFilter]);

  const handleToggleProvider = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/ai/config/providers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle provider");
      toast.success(t(`admin.${currentEnabled ? "providerDisabled" : "providerEnabled"}`));
      mutateProviders();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleSaveProvider = async () => {
    if (!editProvider) return;
    try {
      const res = await fetch(`/api/admin/ai/config/providers/${editProvider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(providerForm),
      });
      if (!res.ok) throw new Error("Failed to update provider");
      toast.success(t("common.success"));
      setEditProvider(null);
      mutateProviders();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleToggleFlag = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/ai/config/flags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle flag");
      toast.success(t("admin.flagUpdated"));
      mutateFlags();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/ai/config/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flagForm),
      });
      if (!res.ok) throw new Error("Failed to create flag");
      toast.success(t("admin.flagCreated"));
      setCreateFlagOpen(false);
      setFlagForm({ name: "", category: "", description: "", enabled: true });
      mutateFlags();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleToggleRule = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/ai/config/routing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle rule");
      toast.success(t("admin.ruleUpdated"));
      mutateRouting();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/ai/config/routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleForm),
      });
      if (!res.ok) throw new Error("Failed to create rule");
      toast.success(t("admin.ruleCreated"));
      setCreateRuleOpen(false);
      setRuleForm({ name: "", priority: "1", targetProvider: "", targetModel: "", active: true });
      mutateRouting();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleSaveRule = async () => {
    if (!editRule) return;
    try {
      const res = await fetch(`/api/admin/ai/config/routing/${editRule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleForm),
      });
      if (!res.ok) throw new Error("Failed to update rule");
      toast.success(t("admin.ruleUpdated"));
      setEditRule(null);
      mutateRouting();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleTogglePolicy = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/ai/config/safety/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle policy");
      toast.success(t("admin.policyUpdated"));
      mutateSafety();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/ai/config/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyForm),
      });
      if (!res.ok) throw new Error("Failed to create policy");
      toast.success(t("admin.policyCreated"));
      setCreatePolicyOpen(false);
      setPolicyForm({ name: "", type: "content_filter", severity: "medium", enabled: true, rules: "" });
      mutateSafety();
      mutateStats();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleSavePolicy = async () => {
    if (!editPolicy) return;
    try {
      const res = await fetch(`/api/admin/ai/config/safety/${editPolicy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyForm),
      });
      if (!res.ok) throw new Error("Failed to update policy");
      toast.success(t("admin.policyUpdated"));
      setEditPolicy(null);
      mutateSafety();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/admin/ai/config/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      toast.success(t("admin.settingUpdated"));
      setSettingEdit(null);
      mutateSettings();
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSettingKey.trim()) return;
    await handleSaveSetting(newSettingKey, newSettingValue);
    setAddSettingOpen(false);
    setNewSettingKey("");
    setNewSettingValue("");
  };

  const handleRefreshAll = () => {
    mutateStats();
    mutateProviders();
    mutateFlags();
    mutateRouting();
    mutateSettings();
    mutateSafety();
    mutateActions();
  };

  const isLoading = statsLoading && providersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.aiAdmin") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.aiAdmin")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiAdminDescription")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.aiAdmin") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.aiAdmin")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiAdminDescription")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="mr-2 size-4" />{t("common.refresh")}
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-border mb-4 overflow-x-auto">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors -mb-px whitespace-nowrap",
                tab === tabItem.id ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tabItem.icon}
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{t("admin.aiRuntime.providers")}</p>
                </div>
                <p className="text-2xl font-semibold">{stats.totalProviders ?? providers.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="size-4 text-green-600" />
                  <p className="text-xs text-muted-foreground">{t("common.enabled")}</p>
                </div>
                <p className="text-2xl font-semibold">{stats.enabledProviders ?? providers.filter((p: any) => p.enabled).length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="size-4 text-yellow-600" />
                  <p className="text-xs text-muted-foreground">{t("admin.aiRuntime.models")}</p>
                </div>
                <p className="text-2xl font-semibold">{stats.totalModels ?? filteredModels.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="size-4 text-sky-500" />
                  <p className="text-xs text-muted-foreground">{t("admin.featureFlags.label")}</p>
                </div>
                <p className="text-2xl font-semibold">{stats.activeFlags ?? flags.filter((f: any) => f.enabled).length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="size-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground">{t("admin.routingRules")}</p>
                </div>
                <p className="text-2xl font-semibold">{stats.routingRules ?? routingRules.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="size-4 text-orange-500" />
                  <p className="text-xs text-muted-foreground">{t("admin.safetyPolicies")}</p>
                </div>
                <p className="text-2xl font-semibold">{stats.safetyPolicies ?? safetyPolicies.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ScrollText className="size-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t("admin.adminActions")}</p>
                </div>
                <p className="text-2xl font-semibold">{adminActions.length}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("admin.adminActions")}</h3>
                <div className="space-y-2">
                  {(stats.recentActions?.length ? stats.recentActions : adminActions.slice(0, 5)).length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("common.none")}</p>
                  ) : (
                    (stats.recentActions?.length ? stats.recentActions : adminActions.slice(0, 5)).map((action: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="size-3 text-muted-foreground" />
                          <span>{action.action || action.type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{action.timestamp || action.createdAt || ""}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("admin.systemHealth")}</h3>
                <div className="space-y-2">
                  {(stats.providerHealth?.length ? stats.providerHealth : providers.slice(0, 5)).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Server className="size-3 text-muted-foreground" />
                        <span>{p.name || p.displayName || p.provider}</span>
                      </div>
                      <Badge tone={p.healthy !== false && p.status !== "offline" ? "success" : "warning"}>
                        {p.healthy !== false && p.status !== "offline" ? t("admin.aiRuntime.online") : t("admin.aiRuntime.offline")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "providers" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
            </div>
            {filteredProviders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("admin.aiRuntime.noProviders")}</div>
            ) : (
              <AdminDataTable
                data={filteredProviders}
                keyExtractor={(p: any) => p.id}
                columns={[
                  {
                    key: "name",
                    header: t("common.name"),
                    render: (p: any) => (
                      <div className="flex items-center gap-2">
                        <Brain className="size-4 text-primary" />
                        <span className="font-medium text-sm">{p.displayName || p.name}</span>
                      </div>
                    ),
                  },
                  {
                    key: "type",
                    header: t("admin.policyType"),
                    render: (p: any) => <Badge tone="info">{p.type || "—"}</Badge>,
                  },
                  {
                    key: "status",
                    header: t("common.status"),
                    render: (p: any) => (
                      <Badge tone={p.status === "active" || p.enabled ? "success" : p.status === "error" ? "warning" : "muted"}>
                        {p.status || (p.enabled ? "active" : "disabled")}
                      </Badge>
                    ),
                  },
                  {
                    key: "priority",
                    header: t("admin.rulePriority"),
                    render: (p: any) => <span className="text-sm">{p.priority ?? "—"}</span>,
                  },
                  {
                    key: "enabled",
                    header: t("common.enabled"),
                    render: (p: any) => (
                      <button
                        onClick={() => handleToggleProvider(p.id, p.enabled)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {p.enabled ? (
                          <ToggleRight className="size-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="size-5 text-muted-foreground" />
                        )}
                      </button>
                    ),
                  },
                  {
                    key: "health",
                    header: t("admin.aiRuntime.health"),
                    render: (p: any) => (
                      <div className="flex items-center gap-1">
                        {p.healthy !== false ? (
                          <CheckCircle className="size-3 text-green-600" />
                        ) : (
                          <XCircle className="size-3 text-destructive" />
                        )}
                        <span className="text-xs text-muted-foreground">{p.latencyMs ? `${p.latencyMs}ms` : "—"}</span>
                      </div>
                    ),
                  },
                  {
                    key: "actions",
                    header: t("common.actions"),
                    render: (p: any) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditProvider(p);
                          setProviderForm({
                            displayName: p.displayName || p.name || "",
                            apiKey: p.apiKey || "",
                            region: p.region || "",
                            priority: String(p.priority ?? "1"),
                            timeout: String(p.timeout ?? "30000"),
                            retry: String(p.retry ?? "3"),
                            rateLimit: String(p.rateLimit ?? "100"),
                            status: p.status || "active",
                          });
                        }}
                      >
                        <Edit className="size-3 mr-1" />{t("common.edit")}
                      </Button>
                    ),
                  },
                ]}
              />
            )}

            {editProvider && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t("common.edit")}: {editProvider.displayName || editProvider.name}</h2>
                    <button onClick={() => setEditProvider(null)}><X className="size-4" /></button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("common.name")}</Label>
                      <Input value={providerForm.displayName} onChange={(e) => setProviderForm({ ...providerForm, displayName: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.apiKey")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={providerForm.apiKey}
                          onChange={(e) => setProviderForm({ ...providerForm, apiKey: e.target.value })}
                          placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowApiKey(!showApiKey)}>
                          {showApiKey ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.region")}</Label>
                        <Input value={providerForm.region} onChange={(e) => setProviderForm({ ...providerForm, region: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.rulePriority")}</Label>
                        <Input type="number" value={providerForm.priority} onChange={(e) => setProviderForm({ ...providerForm, priority: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Timeout</Label>
                        <Input type="number" value={providerForm.timeout} onChange={(e) => setProviderForm({ ...providerForm, timeout: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Retry</Label>
                        <Input type="number" value={providerForm.retry} onChange={(e) => setProviderForm({ ...providerForm, retry: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rate Limit</Label>
                        <Input type="number" value={providerForm.rateLimit} onChange={(e) => setProviderForm({ ...providerForm, rateLimit: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("common.status")}</Label>
                      <Input value={providerForm.status} onChange={(e) => setProviderForm({ ...providerForm, status: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setEditProvider(null)}>{t("common.cancel")}</Button>
                      <Button onClick={handleSaveProvider}><Save className="size-4 mr-1" />{t("common.save")}</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "models" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder={`${t("admin.aiRuntime.providers")}...`} className="pl-9" />
              </div>
            </div>
            {filteredModels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("admin.aiRuntime.noProviders")}</div>
            ) : (
              <AdminDataTable
                data={filteredModels}
                keyExtractor={(m: any) => `${m.provider}-${m.model || m.name}`}
                columns={[
                  {
                    key: "model",
                    header: t("common.name"),
                    render: (m: any) => <span className="font-medium text-sm">{m.model || m.name}</span>,
                  },
                  {
                    key: "provider",
                    header: t("admin.aiRuntime.providers"),
                    render: (m: any) => <Badge tone="info">{m.provider}</Badge>,
                  },
                  {
                    key: "capability",
                    header: t("admin.aiRuntime.analytics"),
                    render: (m: any) => <Badge tone="muted">{m.capability || "—"}</Badge>,
                  },
                  {
                    key: "available",
                    header: t("common.enabled"),
                    render: (m: any) => (
                      <Badge tone={m.available !== false ? "success" : "muted"}>
                        {m.available !== false ? "✓" : "✕"}
                      </Badge>
                    ),
                  },
                  {
                    key: "deprecated",
                    header: "Deprecated",
                    render: (m: any) => (
                      <Badge tone={m.deprecated ? "warning" : "muted"}>
                        {m.deprecated ? "Yes" : "No"}
                      </Badge>
                    ),
                  },
                  {
                    key: "creditCost",
                    header: "Credits",
                    render: (m: any) => <span className="text-sm">{m.creditCost ?? "—"}</span>,
                  },
                ]}
              />
            )}
          </div>
        )}

        {tab === "flags" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 min-w-[250px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
              <Button size="sm" onClick={() => setCreateFlagOpen(true)}>
                <Plus className="size-4 mr-1" />{t("admin.createFlag")}
              </Button>
            </div>
            {flags.filter((f: any) => !providerFilter || (f.name || "").toLowerCase().includes(providerFilter.toLowerCase())).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("common.none")}</div>
            ) : (
              <AdminDataTable
                data={flags.filter((f: any) => !providerFilter || (f.name || "").toLowerCase().includes(providerFilter.toLowerCase()))}
                keyExtractor={(f: any) => f.id}
                columns={[
                  {
                    key: "name",
                    header: t("admin.flagName"),
                    render: (f: any) => <span className="font-medium text-sm">{f.name || f.key}</span>,
                  },
                  {
                    key: "category",
                    header: t("admin.flagCategory"),
                    render: (f: any) => <Badge tone="muted">{f.category || "—"}</Badge>,
                  },
                  {
                    key: "enabled",
                    header: t("common.enabled"),
                    render: (f: any) => (
                      <button onClick={() => handleToggleFlag(f.id, f.enabled)} className="flex items-center gap-1 text-sm">
                        {f.enabled ? <ToggleRight className="size-5 text-green-600" /> : <ToggleLeft className="size-5 text-muted-foreground" />}
                      </button>
                    ),
                  },
                  {
                    key: "description",
                    header: t("common.description"),
                    render: (f: any) => <span className="text-sm text-muted-foreground">{f.description || "—"}</span>,
                  },
                ]}
              />
            )}

            {createFlagOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t("admin.createFlag")}</h2>
                    <button onClick={() => setCreateFlagOpen(false)}><X className="size-4" /></button>
                  </div>
                  <form onSubmit={handleCreateFlag} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.flagName")}</Label>
                      <Input value={flagForm.name} onChange={(e) => setFlagForm({ ...flagForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.flagCategory")}</Label>
                      <Input value={flagForm.category} onChange={(e) => setFlagForm({ ...flagForm, category: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("common.description")}</Label>
                      <Input value={flagForm.description} onChange={(e) => setFlagForm({ ...flagForm, description: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setCreateFlagOpen(false)}>{t("common.cancel")}</Button>
                      <Button type="submit">{t("common.create")}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "routing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 min-w-[250px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
              <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                <Plus className="size-4 mr-1" />{t("admin.createRule")}
              </Button>
            </div>
            {routingRules.filter((r: any) => !providerFilter || (r.name || "").toLowerCase().includes(providerFilter.toLowerCase())).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("common.none")}</div>
            ) : (
              <AdminDataTable
                data={routingRules.filter((r: any) => !providerFilter || (r.name || "").toLowerCase().includes(providerFilter.toLowerCase()))}
                keyExtractor={(r: any) => r.id}
                columns={[
                  {
                    key: "name",
                    header: t("admin.ruleName"),
                    render: (r: any) => <span className="font-medium text-sm">{r.name}</span>,
                  },
                  {
                    key: "priority",
                    header: t("admin.rulePriority"),
                    render: (r: any) => <span className="text-sm">{r.priority}</span>,
                  },
                  {
                    key: "targetProvider",
                    header: t("admin.targetProvider"),
                    render: (r: any) => <Badge tone="info">{r.targetProvider}</Badge>,
                  },
                  {
                    key: "targetModel",
                    header: t("admin.targetModel"),
                    render: (r: any) => <Badge tone="muted">{r.targetModel || "—"}</Badge>,
                  },
                  {
                    key: "active",
                    header: t("common.active"),
                    render: (r: any) => (
                      <button onClick={() => handleToggleRule(r.id, r.active)} className="flex items-center gap-1 text-sm">
                        {r.active ? <ToggleRight className="size-5 text-green-600" /> : <ToggleLeft className="size-5 text-muted-foreground" />}
                      </button>
                    ),
                  },
                  {
                    key: "actions",
                    header: t("common.actions"),
                    render: (r: any) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditRule(r);
                          setRuleForm({
                            name: r.name || "",
                            priority: String(r.priority ?? "1"),
                            targetProvider: r.targetProvider || "",
                            targetModel: r.targetModel || "",
                            active: r.active,
                          });
                        }}
                      >
                        <Edit className="size-3 mr-1" />{t("common.edit")}
                      </Button>
                    ),
                  },
                ]}
              />
            )}

            {(createRuleOpen || editRule) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{editRule ? t("common.edit") : t("admin.createRule")}</h2>
                    <button onClick={() => { setCreateRuleOpen(false); setEditRule(null); }}><X className="size-4" /></button>
                  </div>
                  <form onSubmit={editRule ? (e) => { e.preventDefault(); handleSaveRule(); } : handleCreateRule} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.ruleName")}</Label>
                      <Input value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.rulePriority")}</Label>
                      <Input type="number" value={ruleForm.priority} onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.targetProvider")}</Label>
                      <Input value={ruleForm.targetProvider} onChange={(e) => setRuleForm({ ...ruleForm, targetProvider: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.targetModel")}</Label>
                      <Input value={ruleForm.targetModel} onChange={(e) => setRuleForm({ ...ruleForm, targetModel: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => { setCreateRuleOpen(false); setEditRule(null); }}>{t("common.cancel")}</Button>
                      <Button type="submit">{editRule ? t("common.save") : t("common.create")}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "safety" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 min-w-[250px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
              <Button size="sm" onClick={() => setCreatePolicyOpen(true)}>
                <Plus className="size-4 mr-1" />{t("admin.createPolicy")}
              </Button>
            </div>
            {safetyPolicies.filter((p: any) => !providerFilter || (p.name || "").toLowerCase().includes(providerFilter.toLowerCase())).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("common.none")}</div>
            ) : (
              <AdminDataTable
                data={safetyPolicies.filter((p: any) => !providerFilter || (p.name || "").toLowerCase().includes(providerFilter.toLowerCase()))}
                keyExtractor={(p: any) => p.id}
                columns={[
                  {
                    key: "name",
                    header: t("admin.policyName"),
                    render: (p: any) => <span className="font-medium text-sm">{p.name}</span>,
                  },
                  {
                    key: "type",
                    header: t("admin.policyType"),
                    render: (p: any) => <Badge tone="info">{p.type}</Badge>,
                  },
                  {
                    key: "severity",
                    header: t("admin.policySeverity"),
                    render: (p: any) => (
                      <Badge tone={p.severity === "high" || p.severity === "critical" ? "warning" : p.severity === "medium" ? "info" : "muted"}>
                        {p.severity}
                      </Badge>
                    ),
                  },
                  {
                    key: "enabled",
                    header: t("common.enabled"),
                    render: (p: any) => (
                      <button onClick={() => handleTogglePolicy(p.id, p.enabled)} className="flex items-center gap-1 text-sm">
                        {p.enabled ? <ToggleRight className="size-5 text-green-600" /> : <ToggleLeft className="size-5 text-muted-foreground" />}
                      </button>
                    ),
                  },
                  {
                    key: "actions",
                    header: t("common.actions"),
                    render: (p: any) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditPolicy(p);
                          setPolicyForm({
                            name: p.name || "",
                            type: p.type || "content_filter",
                            severity: p.severity || "medium",
                            enabled: p.enabled,
                            rules: p.rules || "",
                          });
                        }}
                      >
                        <Edit className="size-3 mr-1" />{t("common.edit")}
                      </Button>
                    ),
                  },
                ]}
              />
            )}

            {(createPolicyOpen || editPolicy) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{editPolicy ? t("common.edit") : t("admin.createPolicy")}</h2>
                    <button onClick={() => { setCreatePolicyOpen(false); setEditPolicy(null); }}><X className="size-4" /></button>
                  </div>
                  <form onSubmit={editPolicy ? (e) => { e.preventDefault(); handleSavePolicy(); } : handleCreatePolicy} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.policyName")}</Label>
                      <Input value={policyForm.name} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.policyType")}</Label>
                      <Input value={policyForm.type} onChange={(e) => setPolicyForm({ ...policyForm, type: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.policySeverity")}</Label>
                      <Input value={policyForm.severity} onChange={(e) => setPolicyForm({ ...policyForm, severity: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.policyRules")}</Label>
                      <Input value={policyForm.rules} onChange={(e) => setPolicyForm({ ...policyForm, rules: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => { setCreatePolicyOpen(false); setEditPolicy(null); }}>{t("common.cancel")}</Button>
                      <Button type="submit">{editPolicy ? t("common.save") : t("common.create")}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("admin.runtimeSettingsDescription")}</p>
              <Button size="sm" onClick={() => setAddSettingOpen(true)}>
                <Plus className="size-4 mr-1" />{t("common.add")}
              </Button>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Key</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Value</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground w-24">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(settings).map(([key, value]) => (
                    <tr key={key} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-sm">{key}</td>
                      <td className="px-4 py-3">
                        {settingEdit?.key === key ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={settingEdit.value}
                              onChange={(e) => setSettingEdit({ ...settingEdit, value: e.target.value })}
                              className="max-w-xs"
                            />
                            <Button size="sm" onClick={() => handleSaveSetting(key, settingEdit.value)}>
                              <Save className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{String(value)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {settingEdit?.key !== key && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSettingEdit({ key, value: String(value) })}
                          >
                            <Edit className="size-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {Object.keys(settings).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-sm text-muted-foreground">{t("common.none")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {addSettingOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{t("common.add")}</h2>
                    <button onClick={() => setAddSettingOpen(false)}><X className="size-4" /></button>
                  </div>
                  <form onSubmit={handleAddSetting} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key</Label>
                      <Input value={newSettingKey} onChange={(e) => setNewSettingKey(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Value</Label>
                      <Input value={newSettingValue} onChange={(e) => setNewSettingValue(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setAddSettingOpen(false)}>{t("common.cancel")}</Button>
                      <Button type="submit">{t("common.create")}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[250px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
            </div>
            {adminActions.filter((a: any) => !providerFilter || (a.action || "").toLowerCase().includes(providerFilter.toLowerCase()) || (a.target || "").toLowerCase().includes(providerFilter.toLowerCase())).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("common.none")}</div>
            ) : (
              <AdminDataTable
                data={adminActions.filter((a: any) => !providerFilter || (a.action || "").toLowerCase().includes(providerFilter.toLowerCase()) || (a.target || "").toLowerCase().includes(providerFilter.toLowerCase()))}
                keyExtractor={(a: any) => a.id}
                columns={[
                  {
                    key: "action",
                    header: t("admin.auditLogs.action"),
                    render: (a: any) => <span className="font-medium text-sm">{a.action || a.type}</span>,
                  },
                  {
                    key: "target",
                    header: t("admin.auditLogs.target"),
                    render: (a: any) => <Badge tone="info">{a.target || a.resource || "—"}</Badge>,
                  },
                  {
                    key: "admin",
                    header: t("admin.auditLogs.user"),
                    render: (a: any) => <span className="text-sm">{a.admin || a.user || a.actor || "—"}</span>,
                  },
                  {
                    key: "timestamp",
                    header: t("admin.auditLogs.timestamp"),
                    render: (a: any) => (
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {a.timestamp || a.createdAt ? new Date(a.timestamp || a.createdAt).toLocaleString("en-GB") : "—"}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: "details",
                    header: t("admin.auditLogs.details"),
                    render: (a: any) => <span className="text-xs text-muted-foreground">{a.details || "—"}</span>,
                  },
                ]}
              />
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
