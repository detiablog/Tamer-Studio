"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import {
  Key,
  Code,
  Webhook,
  BarChart3,
  Copy,
  Trash2,
  Shield,
  Clock,
  Plus,
  ExternalLink,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ActiveTab = "dashboard" | "keys" | "docs" | "webhooks" | "usage";

const AVAILABLE_SCOPES = [
  "read:profile",
  "read:assets",
  "write:assets",
  "read:projects",
  "write:projects",
  "generate:image",
  "generate:video",
  "publish",
  "storage",
  "analytics",
];

const API_ENDPOINTS = [
  { method: "GET", path: "/api/v1/profile", description: "Get user profile", scope: "read:profile" },
  { method: "GET", path: "/api/v1/credits", description: "Get credit balance", scope: "read:profile" },
  { method: "GET", path: "/api/v1/images", description: "List generated images", scope: "read:assets" },
  { method: "POST", path: "/api/v1/images", description: "Generate new image", scope: "generate:image" },
  { method: "GET", path: "/api/v1/images/:id", description: "Get image details", scope: "read:assets" },
  { method: "DELETE", path: "/api/v1/images/:id", description: "Delete image", scope: "write:assets" },
  { method: "GET", path: "/api/v1/videos", description: "List videos", scope: "read:assets" },
  { method: "POST", path: "/api/v1/videos", description: "Generate new video", scope: "generate:video" },
  { method: "GET", path: "/api/v1/videos/:id", description: "Get video details", scope: "read:assets" },
  { method: "GET", path: "/api/v1/assets", description: "List assets", scope: "read:assets" },
  { method: "POST", path: "/api/v1/assets", description: "Upload asset", scope: "write:assets" },
  { method: "GET", path: "/api/v1/assets/:id", description: "Get asset details", scope: "read:assets" },
  { method: "DELETE", path: "/api/v1/assets/:id", description: "Delete asset", scope: "write:assets" },
  { method: "GET", path: "/api/v1/affiliate/campaigns", description: "List campaigns", scope: "read:profile" },
  { method: "POST", path: "/api/v1/affiliate/campaigns", description: "Create campaign", scope: "write:projects" },
  { method: "GET", path: "/api/v1/affiliate/campaigns/:id", description: "Get campaign details", scope: "read:profile" },
  { method: "GET", path: "/api/v1/drama/projects", description: "List drama projects", scope: "read:projects" },
  { method: "POST", path: "/api/v1/drama/projects", description: "Create drama project", scope: "write:projects" },
  { method: "GET", path: "/api/v1/drama/projects/:id", description: "Get project details", scope: "read:projects" },
  { method: "GET", path: "/api/v1/webhooks", description: "List webhooks", scope: "read:profile" },
  { method: "POST", path: "/api/v1/webhooks", description: "Create webhook", scope: "publish" },
  { method: "PUT", path: "/api/v1/webhooks/:id", description: "Update webhook", scope: "publish" },
  { method: "DELETE", path: "/api/v1/webhooks/:id", description: "Delete webhook", scope: "publish" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function DeveloperPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("dashboard");
  const [showCreateKey, setShowCreateKey] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [newKeyScopes, setNewKeyScopes] = React.useState<string[]>([]);
  const [newKeyExpiry, setNewKeyExpiry] = React.useState<string>("never");
  const [creating, setCreating] = React.useState(false);
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);
  const [showCreateWebhook, setShowCreateWebhook] = React.useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = React.useState("");
  const [newWebhookEvents, setNewWebhookEvents] = React.useState("");
  const [creatingWebhook, setCreatingWebhook] = React.useState(false);
  const [revoking, setRevoking] = React.useState<string | null>(null);
  const [copying, setCopying] = React.useState<string | null>(null);
  const [showRawKeys, setShowRawKeys] = React.useState<Set<string>>(new Set());

  const { data: keysData, isLoading: keysLoading, mutate: mutateKeys } = useSWR("/api/developer/keys", fetcher);
  const { data: webhooksData, isLoading: webhooksLoading, mutate: mutateWebhooks } = useSWR("/api/v1/webhooks", fetcher);

  const keys = keysData?.data ?? [];
  const webhooks = webhooksData?.data ?? [];
  const activeKeys = keys.filter((k: any) => k.status === "active");

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const body: any = { name: newKeyName };
      if (newKeyScopes.length > 0) body.scopes = newKeyScopes;
      if (newKeyExpiry !== "never") body.expiresInDays = parseInt(newKeyExpiry, 10);
      const res = await fetch("/api/developer/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success && result.data?.rawKey) {
        setCreatedKey(result.data.rawKey);
        mutateKeys();
        setNewKeyName("");
        setNewKeyScopes([]);
        setNewKeyExpiry("never");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    setRevoking(id);
    try {
      await fetch(`/api/developer/keys/${id}`, { method: "DELETE" });
      mutateKeys();
    } finally {
      setRevoking(null);
    }
  };

  const handleCopyKey = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopying(id);
    setTimeout(() => setCopying(null), 2000);
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    setCreatingWebhook(true);
    try {
      const events = newWebhookEvents.split(",").map((e) => e.trim()).filter(Boolean);
      await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newWebhookUrl, events }),
      });
      mutateWebhooks();
      setNewWebhookUrl("");
      setNewWebhookEvents("");
      setShowCreateWebhook(false);
    } finally {
      setCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    await fetch(`/api/v1/webhooks/${id}`, { method: "DELETE" });
    mutateWebhooks();
  };

  const tabs = [
    { id: "dashboard" as ActiveTab, label: t("developer.dashboard", "Dashboard"), icon: BarChart3 },
    { id: "keys" as ActiveTab, label: t("developer.apiKeys", "API Keys"), icon: Key },
    { id: "docs" as ActiveTab, label: t("developer.documentation", "Documentation"), icon: Code },
    { id: "webhooks" as ActiveTab, label: t("developer.webhooks", "Webhooks"), icon: Webhook },
    { id: "usage" as ActiveTab, label: t("developer.usage", "Usage"), icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("developer.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("developer.description")}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("developer.totalRequests", "Total Requests")} value={keys.reduce((sum: number, k: any) => sum + parseInt(k.usageCount || "0", 10), 0)} />
            <StatCard title={t("developer.errorRate", "Error Rate")} value="0%" delta={t("common.success")} />
            <StatCard title={t("developer.avgLatency", "Avg Latency")} value="N/A" delta={t("developer.recentActivity", "Recent Activity")} />
            <StatCard title={t("developer.apiKeys", "API Keys")} value={activeKeys.length} delta={`${keys.length} total`} />
          </div>

          <DashboardCard title={t("developer.recentActivity", "Recent Activity")}>
            <p className="text-sm text-muted-foreground text-center py-8">{t("developer.noLogs")}</p>
          </DashboardCard>
        </div>
      )}

      {activeTab === "keys" && (
        <div className="space-y-6">
          {createdKey && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{t("developer.keyCreated")}</p>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => setCreatedKey(null)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-green-100 px-2 py-1 text-xs font-mono dark:bg-green-900">{createdKey}</code>
                <Button variant="outline" size="sm" onClick={() => handleCopyKey(createdKey, "created")}>
                  {copying === "created" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </Button>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">{t("developer.keyCopied")}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("developer.apiKeys")}</h2>
            <Button size="sm" onClick={() => setShowCreateKey(true)}>
              <Plus className="mr-1.5 size-3.5" />
              {t("developer.createApiKey")}
            </Button>
          </div>

          {showCreateKey && (
            <DashboardCard title={t("developer.createApiKey")}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("developer.apiKeyName")}</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    placeholder={t("developer.apiKeyName")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("developer.apiKeyScopes")}</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <label key={scope} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope)}
                          onChange={() => toggleScope(scope)}
                          className="size-4 rounded border-border"
                        />
                        <span className="font-mono text-xs">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("developer.apiKeyExpires")}</label>
                  <select
                    value={newKeyExpiry}
                    onChange={(e) => setNewKeyExpiry(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    <option value="never">Never</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateKey} disabled={creating || !newKeyName.trim()}>
                    {creating ? t("common.loading") : t("common.create")}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowCreateKey(false); setCreatedKey(null); }}>
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            </DashboardCard>
          )}

          {keysLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Key className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("developer.noKeys")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((apiKey: any) => (
                <div key={apiKey.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                      <Key className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge tone={apiKey.status === "active" ? "success" : "muted"}>
                          {apiKey.status === "active" ? "Active" : "Revoked"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{apiKey.keyPrefix}{"••••••••••••"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {timeAgo(apiKey.lastUsed)}
                        </span>
                        <span>{apiKey.usageCount || "0"} {t("developer.apiKeyRequests", "requests")}</span>
                        {apiKey.scopes?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Shield className="size-3" />
                            {apiKey.scopes.length} {t("developer.apiKeyScopes", "scopes")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {apiKey.status === "active" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => handleCopyKey(apiKey.keyPrefix + "••••••••••••", apiKey.id)}
                        >
                          {copying === apiKey.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            const newSet = new Set(showRawKeys);
                            if (newSet.has(apiKey.id)) newSet.delete(apiKey.id);
                            else newSet.add(apiKey.id);
                            setShowRawKeys(newSet);
                          }}
                        >
                          {showRawKeys.has(apiKey.id) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          disabled={revoking === apiKey.id}
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "docs" && (
        <div className="space-y-6">
          <DashboardCard title={t("developer.documentation")} description="REST API v1 endpoints">
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <h3 className="font-medium text-sm mb-2">Authentication</h3>
                <p className="text-xs text-muted-foreground mb-2">All API requests require an API key. Pass it via:</p>
                <div className="space-y-1 text-xs font-mono bg-background rounded-lg p-3">
                  <p>Authorization: Bearer YOUR_API_KEY</p>
                  <p>X-API-Key: YOUR_API_KEY</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Method</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Endpoint</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Description</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {API_ENDPOINTS.map((ep, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-2">
                          <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${METHOD_COLORS[ep.method]}`}>
                            {ep.method}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono text-xs">{ep.path}</td>
                        <td className="py-3 px-2 text-muted-foreground">{ep.description}</td>
                        <td className="py-3 px-2 font-mono text-xs text-muted-foreground">{ep.scope}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {activeTab === "webhooks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("developer.webhooks")}</h2>
            <Button size="sm" onClick={() => setShowCreateWebhook(true)}>
              <Plus className="mr-1.5 size-3.5" />
              {t("developer.createWebhook")}
            </Button>
          </div>

          {showCreateWebhook && (
            <DashboardCard title={t("developer.createWebhook")}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("developer.webhookUrl")}</label>
                  <input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("developer.webhookEvents")}</label>
                  <input
                    type="text"
                    value={newWebhookEvents}
                    onChange={(e) => setNewWebhookEvents(e.target.value)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    placeholder="image.created, video.completed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated event names</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateWebhook} disabled={creatingWebhook || !newWebhookUrl.trim()}>
                    {creatingWebhook ? t("common.loading") : t("common.create")}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateWebhook(false)}>
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            </DashboardCard>
          )}

          {webhooksLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Webhook className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("developer.noWebhooks")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((hook: any) => (
                <div key={hook.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                      <Webhook className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium font-mono text-sm">{hook.url}</h4>
                        <Badge tone={hook.isActive ? "success" : "muted"}>
                          {hook.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {hook.events?.length > 0 && (
                          <span>{hook.events.join(", ")}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {timeAgo(hook.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => window.open(hook.url, "_blank")}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => handleDeleteWebhook(hook.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "usage" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("developer.totalRequests", "Total Requests")} value={keys.reduce((sum: number, k: any) => sum + parseInt(k.usageCount || "0", 10), 0)} />
            <StatCard title={t("developer.errorRate", "Error Rate")} value="0%" />
            <StatCard title={t("developer.avgLatency", "Avg Latency")} value="N/A" />
            <StatCard title={t("developer.apiKeys", "Active Keys")} value={activeKeys.length} />
          </div>

          <DashboardCard title={t("developer.usage", "API Usage")}>
            <p className="text-sm text-muted-foreground text-center py-8">{t("developer.noLogs")}</p>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
