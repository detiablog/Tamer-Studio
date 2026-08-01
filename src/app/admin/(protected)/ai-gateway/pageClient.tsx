"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  Globe,
  Layers,
  Loader,
  Network,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  StopCircle,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
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

type TabKey =
  | "overview"
  | "models"
  | "providers"
  | "routing"
  | "health"
  | "queue"
  | "logs"
  | "analytics"
  | "settings";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "overview", icon: BarChart3 },
  { key: "models", icon: Brain },
  { key: "providers", icon: Globe },
  { key: "routing", icon: Network },
  { key: "health", icon: Activity },
  { key: "queue", icon: Layers },
  { key: "logs", icon: FileText },
  { key: "analytics", icon: TrendingUp },
  { key: "settings", icon: Settings },
];

type GatewayModel = {
  id: string;
  name: string;
  provider: string;
  displayName?: string;
  contextWindow?: number;
  maxOutput?: number;
  inputCostPer1k?: number;
  outputCostPer1k?: number;
  supportsStreaming?: boolean;
  supportsTools?: boolean;
  supportsImages?: boolean;
  supportsVision?: boolean;
  capabilities?: string[];
  qualityScore?: number;
  speedScore?: number;
  reliabilityScore?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type ProviderHealth = {
  id: string;
  providerId: string;
  providerName: string;
  status: string;
  latencyMs?: number;
  successRate?: number;
  failureRate?: number;
  totalRequests?: number;
  totalFailures?: number;
  lastCheckedAt?: string;
  lastError?: string;
  uptime?: number;
  metadata?: Record<string, unknown>;
};

type RoutingDecision = {
  id: string;
  requestId?: string;
  selectedModel?: string;
  selectedProvider?: string;
  fallbackModel?: string;
  fallbackProvider?: string;
  reason?: string;
  costEstimate?: number;
  latencyMs?: number;
  wasFallback?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type CircuitBreaker = {
  id: string;
  providerId: string;
  providerName?: string;
  state: string;
  failureCount?: number;
  successCount?: number;
  threshold?: number;
  resetTimeoutMs?: number;
  lastStateChange?: string;
  metadata?: Record<string, unknown>;
};

type QueueItem = {
  id: string;
  requestId?: string;
  model?: string;
  provider?: string;
  status: string;
  priority?: number;
  retryCount?: number;
  maxRetries?: number;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

type RequestLog = {
  id: string;
  requestId?: string;
  model?: string;
  provider?: string;
  status: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  latencyMs?: number;
  streamingLatencyMs?: number;
  firstTokenMs?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type GatewayAnalytics = {
  totalCost?: number;
  avgCost?: number;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  costByProvider?: Record<string, number>;
  tokensByProvider?: Record<string, number>;
  requestsByProvider?: Record<string, number>;
  dailyCosts?: { date: string; cost: number }[];
  metadata?: Record<string, unknown>;
};

type GatewaySettings = {
  defaultProvider?: string;
  fallbackEnabled?: boolean;
  maxRetries?: number;
  requestTimeout?: number;
  smartRouting?: boolean;
  costOptimization?: boolean;
  qualityThreshold?: number;
  modelScores?: Record<string, { quality: number; speed: number; reliability: number }>;
  featureFlags?: Record<string, boolean>;
  metadata?: Record<string, unknown>;
};

type RoutingStats = {
  totalDecisions?: number;
  fallbackRate?: number;
  avgCost?: number;
  avgLatency?: number;
  byProvider?: Record<string, number>;
  byModel?: Record<string, number>;
  metadata?: Record<string, unknown>;
};

type QueueStatus = {
  waiting?: number;
  running?: number;
  completed?: number;
  failed?: number;
  total?: number;
  metadata?: Record<string, unknown>;
};

type RequestStats = {
  total?: number;
  success?: number;
  failed?: number;
  avgLatency?: number;
  avgCost?: number;
  totalTokens?: number;
  byStatus?: Record<string, number>;
  byProvider?: Record<string, number>;
  byModel?: Record<string, number>;
  metadata?: Record<string, unknown>;
};

type GatewayOverview = {
  totalModels?: number;
  activeProviders?: number;
  totalRequests?: number;
  successRate?: number;
  avgLatency?: number;
  totalCost?: number;
  providerHealth?: ProviderHealth[];
  recentRequests?: RequestLog[];
  metadata?: Record<string, unknown>;
};

export function AIGatewayAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [search, setSearch] = React.useState("");
  const [providerFilter, setProviderFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [editingModel, setEditingModel] = React.useState<GatewayModel | null>(null);
  const [showCreateModel, setShowCreateModel] = React.useState(false);
  const [newModel, setNewModel] = React.useState<Partial<GatewayModel>>({
    name: "",
    provider: "",
    displayName: "",
    contextWindow: 0,
    maxOutput: 0,
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    supportsStreaming: true,
    supportsTools: false,
    supportsImages: false,
    supportsVision: false,
    isActive: true,
  });
  const [selectedLog, setSelectedLog] = React.useState<RequestLog | null>(null);
  const [selectedDecision, setSelectedDecision] = React.useState<RoutingDecision | null>(null);
  const [confirmClearQueue, setConfirmClearQueue] = React.useState(false);
  const [settingsDraft, setSettingsDraft] = React.useState<Partial<GatewaySettings>>({});

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    "/api/ai-gateway/models",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: modelsData, isLoading: modelsLoading, mutate: mutateModels } = useSWR(
    "/api/ai-gateway/models",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: healthData, isLoading: healthLoading, mutate: mutateHealth } = useSWR(
    "/api/ai-gateway/health",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: routingData, isLoading: _routingLoading, mutate: mutateRouting } = useSWR(
    "/api/ai-gateway/routing",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: routingStatsData, isLoading: _routingStatsLoading, mutate: mutateRoutingStats } = useSWR(
    "/api/ai-gateway/routing/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: circuitBreakersData, isLoading: _circuitBreakersLoading, mutate: mutateCircuitBreakers } = useSWR(
    "/api/ai-gateway/circuit-breakers",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueData, isLoading: queueLoading, mutate: mutateQueue } = useSWR(
    "/api/ai-gateway/queue",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueStatusData, isLoading: _queueStatusLoading, mutate: mutateQueueStatus } = useSWR(
    "/api/ai-gateway/queue/status",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: requestsData, isLoading: requestsLoading, mutate: mutateRequests } = useSWR(
    "/api/ai-gateway/requests",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: requestStatsData, isLoading: _requestStatsLoading, mutate: mutateRequestStats } = useSWR(
    "/api/ai-gateway/requests/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: analyticsData, isLoading: _analyticsLoading, mutate: mutateAnalytics } = useSWR(
    "/api/ai-gateway/analytics",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: _metricsData, isLoading: _metricsLoading, mutate: mutateMetrics } = useSWR(
    "/api/ai-gateway/metrics",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const overview: GatewayOverview | null = overviewData?.success ? overviewData.data : null;
  const modelsResponse = modelsData?.success ? modelsData.data : null;
  const models: GatewayModel[] = modelsResponse?.items ?? (Array.isArray(modelsResponse) ? modelsResponse : []);
  const healthResponse = healthData?.success ? healthData.data : null;
  const providerHealthList: ProviderHealth[] = healthResponse?.items ?? (Array.isArray(healthResponse) ? healthResponse : []);
  const routingResponse = routingData?.success ? routingData.data : null;
  const routingDecisions: RoutingDecision[] = routingResponse?.items ?? (Array.isArray(routingResponse) ? routingResponse : []);
  const routingStats: RoutingStats | null = routingStatsData?.success ? routingStatsData.data : null;
  const circuitBreakersResponse = circuitBreakersData?.success ? circuitBreakersData.data : null;
  const circuitBreakers: CircuitBreaker[] = circuitBreakersResponse?.items ?? (Array.isArray(circuitBreakersResponse) ? circuitBreakersResponse : []);
  const queueResponse = queueData?.success ? queueData.data : null;
  const queueItems: QueueItem[] = queueResponse?.items ?? (Array.isArray(queueResponse) ? queueResponse : []);
  const queueStatus: QueueStatus | null = queueStatusData?.success ? queueStatusData.data : null;
  const requestsResponse = requestsData?.success ? requestsData.data : null;
  const requestLogs: RequestLog[] = requestsResponse?.items ?? (Array.isArray(requestsResponse) ? requestsResponse : []);
  const requestStats: RequestStats | null = requestStatsData?.success ? requestStatsData.data : null;
  const analytics: GatewayAnalytics | null = analyticsData?.success ? analyticsData.data : null;

  const defaultSettings: GatewaySettings = {
    defaultProvider: "openai",
    fallbackEnabled: true,
    maxRetries: 3,
    requestTimeout: 30000,
    smartRouting: true,
    costOptimization: false,
    qualityThreshold: 0.7,
    modelScores: {},
    featureFlags: {
      smartRouting: true,
      costOptimization: false,
      autoFailover: true,
      qualityScoring: true,
    },
  };
  const settings: GatewaySettings = { ...defaultSettings, ...settingsDraft };

  const filteredModels = React.useMemo(() => {
    let result = models;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m: GatewayModel) =>
          m.name?.toLowerCase().includes(q) ||
          m.provider?.toLowerCase().includes(q) ||
          m.displayName?.toLowerCase().includes(q)
      );
    }
    if (providerFilter !== "all") {
      result = result.filter((m: GatewayModel) => m.provider === providerFilter);
    }
    return result;
  }, [models, search, providerFilter]);

  const filteredRoutingDecisions = React.useMemo(() => {
    let result = routingDecisions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r: RoutingDecision) =>
          r.selectedModel?.toLowerCase().includes(q) ||
          r.selectedProvider?.toLowerCase().includes(q) ||
          r.reason?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [routingDecisions, search]);

  const filteredRequestLogs = React.useMemo(() => {
    let result = requestLogs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r: RequestLog) =>
          r.model?.toLowerCase().includes(q) ||
          r.provider?.toLowerCase().includes(q) ||
          r.requestId?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r: RequestLog) => r.status === statusFilter);
    }
    if (providerFilter !== "all") {
      result = result.filter((r: RequestLog) => r.provider === providerFilter);
    }
    return result;
  }, [requestLogs, search, statusFilter, providerFilter]);

  const filteredQueueItems = React.useMemo(() => {
    let result = queueItems;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (q2: QueueItem) =>
          q2.model?.toLowerCase().includes(q) ||
          q2.provider?.toLowerCase().includes(q) ||
          q2.requestId?.toLowerCase().includes(q) ||
          q2.status?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((q2: QueueItem) => q2.status === statusFilter);
    }
    return result;
  }, [queueItems, search, statusFilter]);

  const uniqueProviders = React.useMemo(() => {
    const set = new Set<string>();
    models.forEach((m: GatewayModel) => { if (m.provider) set.add(m.provider); });
    providerHealthList.forEach((h: ProviderHealth) => { if (h.providerName) set.add(h.providerName); });
    return Array.from(set);
  }, [models, providerHealthList]);

  const refreshAll = () => {
    mutateOverview();
    mutateModels();
    mutateHealth();
    mutateRouting();
    mutateRoutingStats();
    mutateCircuitBreakers();
    mutateQueue();
    mutateQueueStatus();
    mutateRequests();
    mutateRequestStats();
    mutateAnalytics();
    mutateMetrics();
  };

  const handleCreateModel = async () => {
    try {
      const res = await fetch("/api/ai-gateway/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModel),
      });
      if (res.ok) {
        toast.success(t("common.success", "Model created"));
        setShowCreateModel(false);
        setNewModel({
          name: "",
          provider: "",
          displayName: "",
          contextWindow: 0,
          maxOutput: 0,
          inputCostPer1k: 0,
          outputCostPer1k: 0,
          supportsStreaming: true,
          supportsTools: false,
          supportsImages: false,
          supportsVision: false,
          isActive: true,
        });
        mutateModels();
        mutateOverview();
      } else {
        toast.error(t("common.error", "Error creating model"));
      }
    } catch {
      toast.error(t("common.error", "Error creating model"));
    }
  };

  const handleUpdateModel = async (id: string, updates: Partial<GatewayModel>) => {
    try {
      const res = await fetch(`/api/ai-gateway/models/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Model updated"));
        setEditingModel(null);
        mutateModels();
        mutateOverview();
      } else {
        toast.error(t("common.error", "Error updating model"));
      }
    } catch {
      toast.error(t("common.error", "Error updating model"));
    }
  };

  const handleDeleteModel = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-gateway/models/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Model deleted"));
        mutateModels();
        mutateOverview();
      } else {
        toast.error(t("common.error", "Error deleting model"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting model"));
    }
  };

  const handleUpdateModelScores = async (id: string, scores: { quality: number; speed: number; reliability: number }) => {
    try {
      const res = await fetch(`/api/ai-gateway/models/${id}/scores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scores),
      });
      if (res.ok) {
        toast.success(t("common.success", "Scores updated"));
        mutateModels();
      } else {
        toast.error(t("common.error", "Error updating scores"));
      }
    } catch {
      toast.error(t("common.error", "Error updating scores"));
    }
  };

  const handleRecordHealthCheck = async (providerId: string) => {
    try {
      const res = await fetch(`/api/ai-gateway/health/${providerId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Health check recorded"));
        mutateHealth();
      } else {
        toast.error(t("common.error", "Error recording health check"));
      }
    } catch {
      toast.error(t("common.error", "Error recording health check"));
    }
  };

  const handleResetCircuitBreaker = async (providerId: string) => {
    try {
      const res = await fetch(`/api/ai-gateway/circuit-breakers/${providerId}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success(t("common.success", "Circuit breaker reset"));
        mutateCircuitBreakers();
        mutateHealth();
      } else {
        toast.error(t("common.error", "Error resetting circuit breaker"));
      }
    } catch {
      toast.error(t("common.error", "Error resetting circuit breaker"));
    }
  };

  const handleRetryQueueItem = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-gateway/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", id }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Queue item retrying"));
        mutateQueue();
        mutateQueueStatus();
      } else {
        toast.error(t("common.error", "Error retrying queue item"));
      }
    } catch {
      toast.error(t("common.error", "Error retrying queue item"));
    }
  };

  const handleCancelQueueItem = async (id: string) => {
    try {
      const res = await fetch(`/api/ai-gateway/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", id }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Queue item cancelled"));
        mutateQueue();
        mutateQueueStatus();
      } else {
        toast.error(t("common.error", "Error cancelling queue item"));
      }
    } catch {
      toast.error(t("common.error", "Error cancelling queue item"));
    }
  };

  const handleClearQueue = async () => {
    try {
      const removals = queueItems.map((item: QueueItem) =>
        fetch(`/api/ai-gateway/queue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel", id: item.id }),
        })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "Queue cleared"));
      setConfirmClearQueue(false);
      mutateQueue();
      mutateQueueStatus();
    } catch {
      toast.error(t("common.error", "Error clearing queue"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/ai-gateway/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success(t("common.success", "Settings saved"));
        mutateMetrics();
      } else {
        toast.error(t("common.error", "Error saving settings"));
      }
    } catch {
      toast.error(t("common.error", "Error saving settings"));
    }
  };

  const handleToggleModel = async (model: GatewayModel) => {
    await handleUpdateModel(model.id, { isActive: !model.isActive });
  };

  const isLoading = overviewLoading || modelsLoading || healthLoading;

  const renderStatCard = (label: string, value: string | number, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  };

  const renderHealthCard = (health: ProviderHealth) => (
    <div key={health.providerId ?? health.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">{health.providerName ?? health.providerId}</h4>
          <p className="text-xs text-muted-foreground">{health.providerId}</p>
        </div>
        <Badge tone={health.status === "healthy" ? "success" : health.status === "degraded" ? "warning" : "warning"}>
          {health.status ?? "unknown"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Latency</span>
          <p className="font-medium">{health.latencyMs ?? 0}ms</p>
        </div>
        <div>
          <span className="text-muted-foreground">Success Rate</span>
          <p className="font-medium">{((health.successRate ?? 0) * 100).toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Failures</span>
          <p className="font-medium">{health.totalFailures ?? 0}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Requests</span>
          <p className="font-medium">{health.totalRequests ?? 0}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleRecordHealthCheck(health.providerId)}>
          <RefreshCw className="mr-1 size-3" />
          {t("aiGateway.checkHealth", "Check")}
        </Button>
      </div>
    </div>
  );

  const renderCircuitBreakerCard = (breaker: CircuitBreaker) => (
    <div key={breaker.providerId ?? breaker.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">{breaker.providerName ?? breaker.providerId}</h4>
          <p className="text-xs text-muted-foreground">{breaker.providerId}</p>
        </div>
        <Badge tone={breaker.state === "closed" ? "success" : breaker.state === "half-open" ? "warning" : "warning"}>
          {breaker.state ?? "unknown"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Failures</span>
          <p className="font-medium">{breaker.failureCount ?? 0}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Threshold</span>
          <p className="font-medium">{breaker.threshold ?? 5}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Successes</span>
          <p className="font-medium">{breaker.successCount ?? 0}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Timeout</span>
          <p className="font-medium">{breaker.resetTimeoutMs ?? 30000}ms</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="w-full" onClick={() => handleResetCircuitBreaker(breaker.providerId)}>
        <RotateCcw className="mr-1 size-3" />
        {t("aiGateway.resetBreaker", "Reset")}
      </Button>
    </div>
  );

  const formatCost = (value?: number) => {
    if (value == null) return "$0.00";
    return `$${value.toFixed(4)}`;
  };

  const formatLatency = (value?: number) => {
    if (value == null) return "0ms";
    return `${value.toFixed(0)}ms`;
  };

  const formatPercent = (value?: number) => {
    if (value == null) return "0%";
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("aiGateway.title", "Smart AI Gateway Intelligence") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("aiGateway.title", "Smart AI Gateway Intelligence")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("aiGateway.description", "Manage AI models, providers, routing, health, queue, logs, analytics, and settings")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearch(""); setProviderFilter("all"); setStatusFilter("all"); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`aiGateway.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {renderStatCard(t("aiGateway.totalModels", "Total Models"), overview?.totalModels ?? models.length, Brain)}
                  {renderStatCard(t("aiGateway.activeProviders", "Active Providers"), overview?.activeProviders ?? providerHealthList.filter((h: ProviderHealth) => h.status === "healthy").length, Globe)}
                  {renderStatCard(t("aiGateway.totalRequests", "Total Requests"), overview?.totalRequests ?? requestStats?.total ?? 0, Target)}
                  {renderStatCard(t("aiGateway.successRate", "Success Rate"), formatPercent(overview?.successRate ?? (requestStats?.total ? (requestStats?.success ?? 0) / requestStats.total : 0)), CheckCircle)}
                  {renderStatCard(t("aiGateway.avgLatency", "Avg Latency"), formatLatency(overview?.avgLatency ?? requestStats?.avgLatency), Clock)}
                  {renderStatCard(t("aiGateway.totalCost", "Total Cost"), formatCost(overview?.totalCost ?? analytics?.totalCost), DollarSign)}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.providerHealth", "Provider Health Status")}</h3>
                  {providerHealthList.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("aiGateway.noHealthData", "No provider health data available")}</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {providerHealthList.map(renderHealthCard)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.recentRequests", "Recent Request Logs")}</h3>
                  {(overview?.recentRequests ?? requestLogs.slice(0, 5)).length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("aiGateway.noRecentRequests", "No recent requests")}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-xs text-muted-foreground">
                            <th className="pb-2 pr-4">{t("aiGateway.requestId", "Request ID")}</th>
                            <th className="pb-2 pr-4">{t("common.model", "Model")}</th>
                            <th className="pb-2 pr-4">{t("common.provider", "Provider")}</th>
                            <th className="pb-2 pr-4">{t("common.status", "Status")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.latency", "Latency")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.cost", "Cost")}</th>
                            <th className="pb-2">{t("aiGateway.createdAt", "Created")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(overview?.recentRequests ?? requestLogs.slice(0, 5)).map((log: RequestLog) => (
                            <tr key={log.id} className="border-b border-border/50">
                              <td className="py-2 pr-4 font-mono text-xs">{log.requestId ?? log.id.slice(0, 8)}</td>
                              <td className="py-2 pr-4">{log.model ?? "-"}</td>
                              <td className="py-2 pr-4"><Badge tone="info">{log.provider ?? "-"}</Badge></td>
                              <td className="py-2 pr-4">
                                <Badge tone={log.status === "success" ? "success" : log.status === "error" ? "warning" : "info"}>
                                  {log.status}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4">{formatLatency(log.latencyMs)}</td>
                              <td className="py-2 pr-4">{formatCost(log.cost)}</td>
                              <td className="py-2 text-xs text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("aiGateway.allProviders", "All Providers")}</option>
                    {uniqueProviders.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => setShowCreateModel(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateModel && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiGateway.newModel", "New Model")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateModel(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newModel.name}
                          onChange={(e) => setNewModel((p) => ({ ...p, name: e.target.value }))}
                          placeholder="gpt-4o"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.provider", "Provider")}</label>
                        <Input
                          value={newModel.provider}
                          onChange={(e) => setNewModel((p) => ({ ...p, provider: e.target.value }))}
                          placeholder="openai"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.displayName", "Display Name")}</label>
                        <Input
                          value={newModel.displayName}
                          onChange={(e) => setNewModel((p) => ({ ...p, displayName: e.target.value }))}
                          placeholder="GPT-4o"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.contextWindow", "Context Window")}</label>
                        <Input
                          type="number"
                          value={newModel.contextWindow}
                          onChange={(e) => setNewModel((p) => ({ ...p, contextWindow: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.inputCost", "Input Cost/1k")}</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={newModel.inputCostPer1k}
                          onChange={(e) => setNewModel((p) => ({ ...p, inputCostPer1k: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.outputCost", "Output Cost/1k")}</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={newModel.outputCostPer1k}
                          onChange={(e) => setNewModel((p) => ({ ...p, outputCostPer1k: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateModel(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateModel} disabled={!newModel.name || !newModel.provider}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingModel && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiGateway.editModel", "Edit Model")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingModel(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingModel.name}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.provider", "Provider")}</label>
                        <Input
                          value={editingModel.provider}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, provider: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.displayName", "Display Name")}</label>
                        <Input
                          value={editingModel.displayName ?? ""}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, displayName: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.contextWindow", "Context Window")}</label>
                        <Input
                          type="number"
                          value={editingModel.contextWindow ?? 0}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, contextWindow: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.inputCost", "Input Cost/1k")}</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={editingModel.inputCostPer1k ?? 0}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, inputCostPer1k: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.outputCost", "Output Cost/1k")}</label>
                        <Input
                          type="number"
                          step="0.001"
                          value={editingModel.outputCostPer1k ?? 0}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, outputCostPer1k: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.qualityScore", "Quality Score")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editingModel.qualityScore ?? 0}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, qualityScore: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.speedScore", "Speed Score")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editingModel.speedScore ?? 0}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, speedScore: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.reliabilityScore", "Reliability Score")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={editingModel.reliabilityScore ?? 0}
                          onChange={(e) => setEditingModel((p) => (p ? { ...p, reliabilityScore: Number(e.target.value) } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingModel(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingModel && handleUpdateModel(editingModel.id, editingModel)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {filteredModels.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">{t("aiGateway.noModels", "No models found")}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">{t("common.name", "Name")}</th>
                          <th className="pb-2 pr-4">{t("common.provider", "Provider")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.contextWindow", "Context")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.inputCost", "Input/1k")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.outputCost", "Output/1k")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.qualityScore", "Quality")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.speedScore", "Speed")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.reliabilityScore", "Reliability")}</th>
                          <th className="pb-2 pr-4">{t("common.status", "Status")}</th>
                          <th className="pb-2">{t("common.actions", "Actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredModels.map((model: GatewayModel) => (
                          <tr key={model.id} className="border-b border-border/50">
                            <td className="py-2 pr-4">
                              <div>
                                <span className="font-medium">{model.displayName || model.name}</span>
                                {model.displayName && <span className="text-xs text-muted-foreground ml-1">({model.name})</span>}
                              </div>
                            </td>
                            <td className="py-2 pr-4"><Badge tone="info">{model.provider}</Badge></td>
                            <td className="py-2 pr-4 text-xs">{model.contextWindow ? model.contextWindow.toLocaleString() : "-"}</td>
                            <td className="py-2 pr-4 text-xs">{model.inputCostPer1k != null ? `$${model.inputCostPer1k.toFixed(4)}` : "-"}</td>
                            <td className="py-2 pr-4 text-xs">{model.outputCostPer1k != null ? `$${model.outputCostPer1k.toFixed(4)}` : "-"}</td>
                            <td className="py-2 pr-4 text-xs">{model.qualityScore != null ? model.qualityScore.toFixed(1) : "-"}</td>
                            <td className="py-2 pr-4 text-xs">{model.speedScore != null ? model.speedScore.toFixed(1) : "-"}</td>
                            <td className="py-2 pr-4 text-xs">{model.reliabilityScore != null ? model.reliabilityScore.toFixed(1) : "-"}</td>
                            <td className="py-2 pr-4">
                              <Badge tone={model.isActive ? "success" : "default"}>
                                {model.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleToggleModel(model)}>
                                  {model.isActive ? <Pause className="size-3" /> : <Play className="size-3" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingModel(model)}>
                                  <Tag className="size-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingModel(model)}>
                                  <Cpu className="size-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteModel(model.id)}>
                                  <X className="size-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "providers" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{t("aiGateway.providerHealthStatus", "Provider Health Status")}</h3>
                  <Button variant="outline" size="sm" onClick={() => mutateHealth()}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>

                {providerHealthList.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">{t("aiGateway.noProviders", "No providers configured")}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {providerHealthList.map((health: ProviderHealth) => (
                      <div key={health.providerId ?? health.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">{health.providerName ?? health.providerId}</h4>
                            <p className="text-xs text-muted-foreground">{health.providerId}</p>
                          </div>
                          <Badge tone={health.status === "healthy" ? "success" : health.status === "degraded" ? "warning" : "warning"}>
                            {health.status ?? "unknown"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">{t("aiGateway.latency", "Latency")}</span>
                            <p className="font-medium">{health.latencyMs ?? 0}ms</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("aiGateway.successRate", "Success Rate")}</span>
                            <p className="font-medium">{((health.successRate ?? 0) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("aiGateway.failureRate", "Failure Rate")}</span>
                            <p className="font-medium">{((health.failureRate ?? 0) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("aiGateway.uptime", "Uptime")}</span>
                            <p className="font-medium">{((health.uptime ?? 1) * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("aiGateway.totalRequests", "Requests")}</span>
                            <p className="font-medium">{health.totalRequests ?? 0}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("aiGateway.totalFailures", "Failures")}</span>
                            <p className="font-medium">{health.totalFailures ?? 0}</p>
                          </div>
                        </div>
                        {health.lastCheckedAt && (
                          <p className="text-xs text-muted-foreground">
                            {t("aiGateway.lastChecked", "Last checked")}: {new Date(health.lastCheckedAt).toLocaleString()}
                          </p>
                        )}
                        {health.lastError && (
                          <p className="text-xs text-red-500 truncate">{health.lastError}</p>
                        )}
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleRecordHealthCheck(health.providerId)}>
                          <RefreshCw className="mr-1 size-3" />
                          {t("aiGateway.recordCheck", "Record Health Check")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "routing" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("aiGateway.totalDecisions", "Total Decisions"), routingStats?.totalDecisions ?? routingDecisions.length, Network)}
                  {renderStatCard(t("aiGateway.fallbackRate", "Fallback Rate"), formatPercent(routingStats?.fallbackRate), AlertTriangle)}
                  {renderStatCard(t("aiGateway.avgCost", "Avg Cost"), formatCost(routingStats?.avgCost), DollarSign)}
                  {renderStatCard(t("aiGateway.avgLatency", "Avg Latency"), formatLatency(routingStats?.avgLatency), Clock)}
                </div>

                {routingStats?.byProvider && Object.keys(routingStats.byProvider).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("aiGateway.decisionsByProvider", "Routing Decisions by Provider")}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(routingStats.byProvider).map(([provider, count]) => (
                        <div key={provider} className="rounded-xl border border-border bg-muted/20 p-3 flex items-center justify-between">
                          <span className="text-sm font-medium">{provider}</span>
                          <Badge tone="info">{String(count)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold">{t("aiGateway.routingDecisions", "Routing Decisions")}</h3>
                    <Button variant="outline" size="sm" onClick={() => mutateRouting()}>
                      <RefreshCw className="size-4" />
                    </Button>
                  </div>

                  <div className="relative flex-1 min-w-[250px] mb-3">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>

                  {selectedDecision && (
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{t("aiGateway.decisionDetails", "Routing Decision Details")}</h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDecision(null)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{selectedDecision.id}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.requestId", "Request")}:</span> <span className="font-mono text-xs">{selectedDecision.requestId ?? "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("common.model", "Model")}:</span> <span>{selectedDecision.selectedModel ?? "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("common.provider", "Provider")}:</span> <span>{selectedDecision.selectedProvider ?? "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.fallbackModel", "Fallback Model")}:</span> <span>{selectedDecision.fallbackModel ?? "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.fallbackProvider", "Fallback Provider")}:</span> <span>{selectedDecision.fallbackProvider ?? "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.reason", "Reason")}:</span> <span>{selectedDecision.reason ?? "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.costEstimate", "Cost Estimate")}:</span> <span>{formatCost(selectedDecision.costEstimate)}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.latency", "Latency")}:</span> <span>{formatLatency(selectedDecision.latencyMs)}</span></div>
                        <div><span className="text-muted-foreground">{t("aiGateway.wasFallback", "Was Fallback")}:</span> <span>{selectedDecision.wasFallback ? "Yes" : "No"}</span></div>
                      </div>
                    </div>
                  )}

                  {filteredRoutingDecisions.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">{t("aiGateway.noDecisions", "No routing decisions found")}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-xs text-muted-foreground">
                            <th className="pb-2 pr-4">{t("common.model", "Model")}</th>
                            <th className="pb-2 pr-4">{t("common.provider", "Provider")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.reason", "Reason")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.cost", "Cost")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.latency", "Latency")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.fallback", "Fallback")}</th>
                            <th className="pb-2 pr-4">{t("aiGateway.createdAt", "Created")}</th>
                            <th className="pb-2">{t("common.actions", "Actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRoutingDecisions.map((decision: RoutingDecision) => (
                            <tr key={decision.id} className="border-b border-border/50">
                              <td className="py-2 pr-4 text-sm">{decision.selectedModel ?? "-"}</td>
                              <td className="py-2 pr-4"><Badge tone="info">{decision.selectedProvider ?? "-"}</Badge></td>
                              <td className="py-2 pr-4 text-xs truncate max-w-[200px]">{decision.reason ?? "-"}</td>
                              <td className="py-2 pr-4 text-xs">{formatCost(decision.costEstimate)}</td>
                              <td className="py-2 pr-4 text-xs">{formatLatency(decision.latencyMs)}</td>
                              <td className="py-2 pr-4">
                                <Badge tone={decision.wasFallback ? "warning" : "default"}>
                                  {decision.wasFallback ? "Yes" : "No"}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4 text-xs text-muted-foreground">{decision.createdAt ? new Date(decision.createdAt).toLocaleString() : "-"}</td>
                              <td className="py-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedDecision(decision)}>
                                  <Cpu className="size-3" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "health" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.providerHealthCards", "Provider Health Status")}</h3>
                  {providerHealthList.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("aiGateway.noHealthData", "No provider health data available")}</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {providerHealthList.map(renderHealthCard)}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.circuitBreakers", "Circuit Breakers")}</h3>
                  {circuitBreakers.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t("aiGateway.noCircuitBreakers", "No circuit breaker data available")}</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {circuitBreakers.map(renderCircuitBreakerCard)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "queue" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("aiGateway.waiting", "Waiting"), queueStatus?.waiting ?? 0, Clock)}
                  {renderStatCard(t("aiGateway.running", "Running"), queueStatus?.running ?? 0, Play)}
                  {renderStatCard(t("aiGateway.completed", "Completed"), queueStatus?.completed ?? 0, CheckCircle)}
                  {renderStatCard(t("aiGateway.failed", "Failed"), queueStatus?.failed ?? 0, XCircle)}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("aiGateway.allStatuses", "All Statuses")}</option>
                    <option value="waiting">{t("aiGateway.waiting", "Waiting")}</option>
                    <option value="running">{t("aiGateway.running", "Running")}</option>
                    <option value="completed">{t("aiGateway.completed", "Completed")}</option>
                    <option value="failed">{t("aiGateway.failed", "Failed")}</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={() => setConfirmClearQueue(true)}>
                    <Trash2 className="mr-2 size-4" />
                    {t("aiGateway.clearQueue", "Clear Queue")}
                  </Button>
                </div>

                {confirmClearQueue && (
                  <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-center justify-between">
                    <p className="text-sm">{t("aiGateway.confirmClearQueue", "Are you sure you want to clear the entire queue?")}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setConfirmClearQueue(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleClearQueue}>
                        {t("common.confirm", "Confirm")}
                      </Button>
                    </div>
                  </div>
                )}

                {queueLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredQueueItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">{t("aiGateway.noQueueItems", "No queue items")}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">{t("aiGateway.requestId", "Request ID")}</th>
                          <th className="pb-2 pr-4">{t("common.model", "Model")}</th>
                          <th className="pb-2 pr-4">{t("common.provider", "Provider")}</th>
                          <th className="pb-2 pr-4">{t("common.status", "Status")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.priority", "Priority")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.retries", "Retries")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.error", "Error")}</th>
                          <th className="pb-2">{t("common.actions", "Actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQueueItems.map((item: QueueItem) => (
                          <tr key={item.id} className="border-b border-border/50">
                            <td className="py-2 pr-4 font-mono text-xs">{item.requestId ?? item.id.slice(0, 8)}</td>
                            <td className="py-2 pr-4 text-sm">{item.model ?? "-"}</td>
                            <td className="py-2 pr-4"><Badge tone="info">{item.provider ?? "-"}</Badge></td>
                            <td className="py-2 pr-4">
                              <Badge tone={item.status === "completed" ? "success" : item.status === "failed" ? "warning" : item.status === "running" ? "info" : "default"}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4 text-xs">{item.priority ?? 0}</td>
                            <td className="py-2 pr-4 text-xs">{item.retryCount ?? 0}/{item.maxRetries ?? 3}</td>
                            <td className="py-2 pr-4 text-xs text-red-500 truncate max-w-[200px]">{item.error ?? "-"}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-1">
                                {(item.status === "failed" || item.status === "waiting") && (
                                  <Button variant="ghost" size="sm" onClick={() => handleRetryQueueItem(item.id)}>
                                    <RotateCcw className="size-3" />
                                  </Button>
                                )}
                                {(item.status === "waiting" || item.status === "running") && (
                                  <Button variant="ghost" size="sm" onClick={() => handleCancelQueueItem(item.id)}>
                                    <StopCircle className="size-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "logs" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {renderStatCard(t("aiGateway.total", "Total"), requestStats?.total ?? requestLogs.length, Target)}
                  {renderStatCard(t("aiGateway.success", "Success"), requestStats?.success ?? 0, CheckCircle)}
                  {renderStatCard(t("aiGateway.failed", "Failed"), requestStats?.failed ?? 0, XCircle)}
                  {renderStatCard(t("aiGateway.avgLatency", "Avg Latency"), formatLatency(requestStats?.avgLatency), Clock)}
                  {renderStatCard(t("aiGateway.avgCost", "Avg Cost"), formatCost(requestStats?.avgCost), DollarSign)}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("aiGateway.allStatuses", "All Statuses")}</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                    <option value="timeout">Timeout</option>
                    <option value="rate_limited">Rate Limited</option>
                  </select>
                  <select
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("aiGateway.allProviders", "All Providers")}</option>
                    {uniqueProviders.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {requestStats?.byProvider && Object.keys(requestStats.byProvider).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("aiGateway.requestsByProvider", "Requests by Provider")}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(requestStats.byProvider).map(([provider, count]) => (
                        <div key={provider} className="rounded-xl border border-border bg-muted/20 p-3 flex items-center justify-between">
                          <span className="text-sm font-medium">{provider}</span>
                          <Badge tone="info">{String(count)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiGateway.requestDetails", "Request Details")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{selectedLog.id}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.requestId", "Request")}:</span> <span className="font-mono text-xs">{selectedLog.requestId ?? "-"}</span></div>
                      <div><span className="text-muted-foreground">{t("common.model", "Model")}:</span> <span>{selectedLog.model ?? "-"}</span></div>
                      <div><span className="text-muted-foreground">{t("common.provider", "Provider")}:</span> <span>{selectedLog.provider ?? "-"}</span></div>
                      <div><span className="text-muted-foreground">{t("common.status", "Status")}:</span> <span>{selectedLog.status}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.inputTokens", "Input Tokens")}:</span> <span>{selectedLog.inputTokens ?? 0}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.outputTokens", "Output Tokens")}:</span> <span>{selectedLog.outputTokens ?? 0}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.totalTokens", "Total Tokens")}:</span> <span>{selectedLog.totalTokens ?? 0}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.cost", "Cost")}:</span> <span>{formatCost(selectedLog.cost)}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.latency", "Latency")}:</span> <span>{formatLatency(selectedLog.latencyMs)}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.firstTokenLatency", "First Token")}:</span> <span>{formatLatency(selectedLog.firstTokenMs)}</span></div>
                      <div><span className="text-muted-foreground">{t("aiGateway.createdAt", "Created")}:</span> <span>{selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : "-"}</span></div>
                    </div>
                    {selectedLog.errorMessage && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                        <p className="text-xs text-red-500">{selectedLog.errorMessage}</p>
                      </div>
                    )}
                  </div>
                )}

                {requestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRequestLogs.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">{t("aiGateway.noLogs", "No request logs found")}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">{t("aiGateway.requestId", "Request ID")}</th>
                          <th className="pb-2 pr-4">{t("common.model", "Model")}</th>
                          <th className="pb-2 pr-4">{t("common.provider", "Provider")}</th>
                          <th className="pb-2 pr-4">{t("common.status", "Status")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.tokens", "Tokens")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.cost", "Cost")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.latency", "Latency")}</th>
                          <th className="pb-2 pr-4">{t("aiGateway.createdAt", "Created")}</th>
                          <th className="pb-2">{t("common.actions", "Actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequestLogs.map((log: RequestLog) => (
                          <tr key={log.id} className="border-b border-border/50">
                            <td className="py-2 pr-4 font-mono text-xs">{log.requestId ?? log.id.slice(0, 8)}</td>
                            <td className="py-2 pr-4 text-sm">{log.model ?? "-"}</td>
                            <td className="py-2 pr-4"><Badge tone="info">{log.provider ?? "-"}</Badge></td>
                            <td className="py-2 pr-4">
                              <Badge tone={log.status === "success" ? "success" : log.status === "error" ? "warning" : "info"}>
                                {log.status}
                              </Badge>
                            </td>
                            <td className="py-2 pr-4 text-xs">{log.totalTokens ?? 0}</td>
                            <td className="py-2 pr-4 text-xs">{formatCost(log.cost)}</td>
                            <td className="py-2 pr-4 text-xs">{formatLatency(log.latencyMs)}</td>
                            <td className="py-2 pr-4 text-xs text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                            <td className="py-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                <Cpu className="size-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("aiGateway.totalCost", "Total Cost"), formatCost(analytics?.totalCost), DollarSign)}
                  {renderStatCard(t("aiGateway.avgCost", "Avg Cost"), formatCost(analytics?.avgCost), TrendingUp)}
                  {renderStatCard(t("aiGateway.totalTokens", "Total Tokens"), (analytics?.totalTokens ?? 0).toLocaleString(), Layers)}
                  {renderStatCard(t("aiGateway.requests", "Requests"), requestStats?.total ?? 0, Target)}
                </div>

                {analytics?.costByProvider && Object.keys(analytics.costByProvider).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("aiGateway.costByProvider", "Cost by Provider")}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(analytics.costByProvider).map(([provider, cost]) => (
                        <div key={provider} className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{provider}</span>
                            <Badge tone="info">{formatCost(cost)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("aiGateway.requests", "Requests")}: {analytics.requestsByProvider?.[provider] ?? 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics?.tokensByProvider && Object.keys(analytics.tokensByProvider).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("aiGateway.tokenUsage", "Token Usage by Provider")}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(analytics.tokensByProvider).map(([provider, tokens]) => (
                        <div key={provider} className="rounded-xl border border-border bg-muted/20 p-3 flex items-center justify-between">
                          <span className="text-sm font-medium">{provider}</span>
                          <span className="text-sm text-muted-foreground">{tokens.toLocaleString()} tokens</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics?.dailyCosts && analytics.dailyCosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t("aiGateway.dailyCosts", "Daily Cost Trends")}</h3>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-end gap-1 h-40">
                        {analytics.dailyCosts.map((day) => {
                          const maxCost = Math.max(...analytics.dailyCosts!.map((d) => d.cost), 1);
                          const height = Math.max((day.cost / maxCost) * 100, 2);
                          return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">{formatCost(day.cost)}</span>
                              <div
                                className="w-full bg-primary/20 rounded-t"
                                style={{ height: `${height}%` }}
                              />
                              <span className="text-[10px] text-muted-foreground">{day.date.slice(5)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {(!analytics?.costByProvider || Object.keys(analytics.costByProvider).length === 0) &&
                 (!analytics?.dailyCosts || analytics.dailyCosts.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">{t("aiGateway.noAnalyticsData", "No analytics data available yet")}</p>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.userPreferences", "User Preferences")}</h3>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.defaultProvider", "Default Provider")}</label>
                        <Input
                          value={settings.defaultProvider ?? ""}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, defaultProvider: e.target.value }))}
                          placeholder="openai"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.maxRetries", "Max Retries")}</label>
                        <Input
                          type="number"
                          value={settings.maxRetries ?? 3}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, maxRetries: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.requestTimeout", "Request Timeout (ms)")}</label>
                        <Input
                          type="number"
                          value={settings.requestTimeout ?? 30000}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, requestTimeout: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiGateway.qualityThreshold", "Quality Threshold")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={settings.qualityThreshold ?? 0.7}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, qualityThreshold: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.modelScoresConfig", "Model Scores Configuration")}</h3>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    {models.length === 0 ? (
                      <p className="text-muted-foreground text-sm">{t("aiGateway.noModels", "No models configured")}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                              <th className="pb-2 pr-4">{t("common.model", "Model")}</th>
                              <th className="pb-2 pr-4">{t("common.provider", "Provider")}</th>
                              <th className="pb-2 pr-4">{t("aiGateway.qualityScore", "Quality")}</th>
                              <th className="pb-2 pr-4">{t("aiGateway.speedScore", "Speed")}</th>
                              <th className="pb-2 pr-4">{t("aiGateway.reliabilityScore", "Reliability")}</th>
                              <th className="pb-2">{t("common.actions", "Actions")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {models.map((model: GatewayModel) => {
                              const scores = settings.modelScores?.[model.id] ?? {
                                quality: model.qualityScore ?? 0.5,
                                speed: model.speedScore ?? 0.5,
                                reliability: model.reliabilityScore ?? 0.5,
                              };
                              return (
                                <tr key={model.id} className="border-b border-border/50">
                                  <td className="py-2 pr-4 font-medium">{model.displayName || model.name}</td>
                                  <td className="py-2 pr-4"><Badge tone="info">{model.provider}</Badge></td>
                                  <td className="py-2 pr-4">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="1"
                                      className="w-20"
                                      value={scores.quality}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setSettingsDraft((p) => ({
                                          ...p,
                                          modelScores: {
                                            ...p.modelScores,
                                            [model.id]: { ...scores, quality: val },
                                          },
                                        }));
                                      }}
                                    />
                                  </td>
                                  <td className="py-2 pr-4">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="1"
                                      className="w-20"
                                      value={scores.speed}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setSettingsDraft((p) => ({
                                          ...p,
                                          modelScores: {
                                            ...p.modelScores,
                                            [model.id]: { ...scores, speed: val },
                                          },
                                        }));
                                      }}
                                    />
                                  </td>
                                  <td className="py-2 pr-4">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="1"
                                      className="w-20"
                                      value={scores.reliability}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setSettingsDraft((p) => ({
                                          ...p,
                                          modelScores: {
                                            ...p.modelScores,
                                            [model.id]: { ...scores, reliability: val },
                                          },
                                        }));
                                      }}
                                    />
                                  </td>
                                  <td className="py-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateModelScores(model.id, scores)}
                                    >
                                      <Save className="size-3" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("aiGateway.featureFlags", "Feature Flags")}</h3>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    {[
                      { key: "smartRouting", label: t("aiGateway.smartRouting", "Smart Routing") },
                      { key: "costOptimization", label: t("aiGateway.costOptimization", "Cost Optimization") },
                      { key: "fallbackEnabled", label: t("aiGateway.fallbackEnabled", "Fallback Enabled") },
                    ].map((flag) => (
                      <div key={flag.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{flag.label}</p>
                          <p className="text-xs text-muted-foreground">{flag.key}</p>
                        </div>
                        <Button
                          variant={settings.featureFlags?.[flag.key] ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setSettingsDraft((p) => ({
                              ...p,
                              featureFlags: {
                                ...p.featureFlags,
                                [flag.key]: !(p.featureFlags?.[flag.key] ?? settings.featureFlags?.[flag.key] ?? false),
                              },
                            }))
                          }
                        >
                          {settings.featureFlags?.[flag.key] ?? false ? "ON" : "OFF"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSaveSettings}>
                    <Save className="mr-2 size-4" />
                    {t("common.save", "Save")}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DashboardCard>
    </div>
  );
}
