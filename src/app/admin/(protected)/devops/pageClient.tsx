"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Rocket,
  RefreshCw,
  Loader,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Globe,
  Cpu,
  Server,
  Activity,
  HardDrive,
  Upload,
  Download,
  GitBranch,
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

type Tab = "overview" | "deployments" | "health" | "workers" | "releases" | "backups";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "healthy"
      ? "bg-green-500"
      : status === "running"
        ? "bg-green-500"
        : status === "completed"
          ? "bg-green-500"
          : status === "warning"
            ? "bg-amber-500"
            : status === "pending"
              ? "bg-amber-500"
              : status === "failed"
                ? "bg-red-500"
                : status === "stopped"
                  ? "bg-red-500"
                  : "bg-gray-400";
  return <span className={cn("inline-block size-2.5 rounded-full", color)} />;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "healthy"
      ? "success"
      : status === "running"
        ? "success"
        : status === "completed"
          ? "success"
          : status === "pending"
            ? "warning"
            : status === "warning"
              ? "warning"
              : status === "failed"
                ? "default"
                : status === "stopped"
                  ? "default"
                  : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

export function DevOpsPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [showCreateDeployment, setShowCreateDeployment] = React.useState(false);
  const [showCreateRelease, setShowCreateRelease] = React.useState(false);
  const [showRegisterWorker, setShowRegisterWorker] = React.useState(false);
  const [newDeployment, setNewDeployment] = React.useState({ version: "", environment: "production", commit: "", status: "pending" });
  const [newRelease, setNewRelease] = React.useState({ version: "", name: "", notes: "" });
  const [newWorker, setNewWorker] = React.useState({ name: "", type: "background" });

  const { data: deploymentsData, isLoading: deploymentsLoading, mutate: mutateDeployments } = useSWR(
    "/api/admin/devops/deployments",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: healthData, isLoading: healthLoading, mutate: mutateHealth } = useSWR(
    "/api/admin/devops/health",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: workersData, isLoading: workersLoading, mutate: mutateWorkers } = useSWR(
    "/api/admin/devops/workers",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: releasesData, isLoading: releasesLoading, mutate: mutateReleases } = useSWR(
    "/api/admin/devops/releases",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: backupsData, isLoading: backupsLoading, mutate: mutateBackups } = useSWR(
    "/api/admin/devops/backups",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const deployments = React.useMemo(() => {
    if (deploymentsData?.success && Array.isArray(deploymentsData.data)) return deploymentsData.data;
    return [];
  }, [deploymentsData]);

  const services = React.useMemo(() => {
    if (healthData?.success && Array.isArray(healthData.data)) return healthData.data;
    return [];
  }, [healthData]);

  const workers = React.useMemo(() => {
    if (workersData?.success && Array.isArray(workersData.data)) return workersData.data;
    return [];
  }, [workersData]);

  const releases = React.useMemo(() => {
    if (releasesData?.success && Array.isArray(releasesData.data)) return releasesData.data;
    return [];
  }, [releasesData]);

  const backups = React.useMemo(() => {
    if (backupsData?.success && Array.isArray(backupsData.data)) return backupsData.data;
    return [];
  }, [backupsData]);

  const latestDeployment = deployments[0] || null;
  const healthyServices = services.filter((s: any) => s.status === "healthy").length;
  const unhealthyServices = services.filter((s: any) => s.status !== "healthy").length;
  const activeWorkers = workers.filter((w: any) => w.status === "running").length;

  const handleCreateDeployment = async () => {
    if (!newDeployment.version) {
      toast.error(t("admin.error.missingFields", "Please fill in all fields."));
      return;
    }
    try {
      const res = await fetch("/api/admin/devops/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeployment),
      });
      if (res.ok) {
        toast.success(t("admin.devops.deploymentCreated", "Deployment created"));
        setShowCreateDeployment(false);
        setNewDeployment({ version: "", environment: "production", commit: "", status: "pending" });
        mutateDeployments();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateRelease = async () => {
    if (!newRelease.version || !newRelease.name) {
      toast.error(t("admin.error.missingFields", "Please fill in all fields."));
      return;
    }
    try {
      const res = await fetch("/api/admin/devops/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRelease),
      });
      if (res.ok) {
        toast.success(t("admin.devops.releaseCreated", "Release created"));
        setShowCreateRelease(false);
        setNewRelease({ version: "", name: "", notes: "" });
        mutateReleases();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleRegisterWorker = async () => {
    if (!newWorker.name) {
      toast.error(t("admin.error.missingFields", "Please fill in all fields."));
      return;
    }
    try {
      const res = await fetch("/api/admin/devops/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorker),
      });
      if (res.ok) {
        toast.success(t("admin.devops.workerRegistered", "Worker registered"));
        setShowRegisterWorker(false);
        setNewWorker({ name: "", type: "background" });
        mutateWorkers();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await fetch("/api/admin/devops/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `backup-${Date.now()}`, type: "full" }),
      });
      if (res.ok) {
        toast.success(t("admin.devops.backupCreated", "Backup created"));
        mutateBackups();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("admin.overview", "Overview") },
    { key: "deployments", label: t("admin.devops.deployments", "Deployments") },
    { key: "health", label: t("admin.devops.serviceHealth", "Service Health") },
    { key: "workers", label: t("admin.workers", "Workers") },
    { key: "releases", label: t("admin.devops.releases", "Releases") },
    { key: "backups", label: t("admin.devops.backups", "Backups") },
  ];

  if (deploymentsLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.devops.devops", "DevOps") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.devops.devops", "DevOps")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.devops.devopsDescription", "Deployment, infrastructure, and operations management")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.devops.devops", "DevOps") }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold leading-tight">{t("admin.devops.devops", "DevOps")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t("admin.devops.devopsDescription", "Deployment, infrastructure, and operations management")}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t_item.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t_item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t("admin.devops.currentVersion", "Current Version"), value: latestDeployment?.version || "-", icon: <Rocket className="size-4" /> },
                { label: t("admin.devops.lastDeployment", "Last Deployment"), value: latestDeployment?.createdAt || "-", icon: <Clock className="size-4" /> },
                { label: t("admin.devops.deploymentStatus", "Deployment Status"), value: latestDeployment?.status || "-", icon: <Activity className="size-4" />, badge: latestDeployment?.status },
                { label: t("admin.devops.pipelineStatus", "Pipeline Status"), value: latestDeployment?.environment || "-", icon: <GitBranch className="size-4" /> },
                { label: t("admin.devops.environmentHealth", "Environment Health"), value: `${healthyServices}/${services.length}`, icon: <Globe className="size-4" /> },
                { label: t("admin.devops.workerHealth", "Worker Health"), value: `${activeWorkers}/${workers.length}`, icon: <Cpu className="size-4" /> },
                { label: t("admin.devops.backupStatus", "Backup Status"), value: backups.length > 0 ? backups[0].status : "-", icon: <HardDrive className="size-4" /> },
                { label: t("admin.devops.applicationUptime", "Application Uptime"), value: latestDeployment?.uptime || "-", icon: <Server className="size-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-2xl font-semibold truncate">{stat.value}</p>
                    {stat.badge && <StatusBadge status={stat.badge} />}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title={t("admin.devops.serviceHealth", "Service Health")}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <div key={service.name} className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted/40">
                    <Server className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{service.name}</p>
                      <StatusDot status={service.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{service.status}</p>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center col-span-full">{t("common.noData", "No data available")}</p>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "deployments" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.devops.deployments", "Deployments")}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutateDeployments()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
                <Button size="sm" onClick={() => setShowCreateDeployment(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("admin.devops.createDeployment", "Create Deployment")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.deploymentVersion", "Version")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.deploymentEnvironment", "Environment")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.deploymentStatus", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.deploymentCommit", "Commit")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.deployedBy", "Deployed By")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.time", "Time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((dep: any) => (
                    <tr key={dep.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{dep.version}</td>
                      <td className="py-3 text-muted-foreground">{dep.environment}</td>
                      <td className="py-3"><StatusBadge status={dep.status} /></td>
                      <td className="py-3 text-muted-foreground font-mono text-xs">{dep.commit || "-"}</td>
                      <td className="py-3 text-muted-foreground">{dep.deployedBy || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{dep.createdAt}</td>
                    </tr>
                  ))}
                  {deployments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("admin.devops.noDeployments", "No deployments recorded")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateDeployment && (
            <DashboardCard title={t("admin.devops.createDeployment", "Create Deployment")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("admin.devops.deploymentVersion", "Version")}</Label>
                  <Input
                    value={newDeployment.version}
                    onChange={(e) => setNewDeployment({ ...newDeployment, version: e.target.value })}
                    placeholder="1.0.0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("admin.devops.deploymentEnvironment", "Environment")}</Label>
                  <select
                    value={newDeployment.environment}
                    onChange={(e) => setNewDeployment({ ...newDeployment, environment: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div>
                  <Label>{t("admin.devops.deploymentCommit", "Commit")}</Label>
                  <Input
                    value={newDeployment.commit}
                    onChange={(e) => setNewDeployment({ ...newDeployment, commit: e.target.value })}
                    placeholder="abc123"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateDeployment(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateDeployment}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "health" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.devops.serviceHealth", "Service Health")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateHealth()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.name", "Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.uptime", "Uptime")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.lastChecked", "Last Checked")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.error", "Error")}</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service: any) => (
                    <tr key={service.name} className="border-b border-border/50">
                      <td className="py-3 font-medium">{service.name}</td>
                      <td className="py-3"><StatusBadge status={service.status} /></td>
                      <td className="py-3 text-muted-foreground">{service.uptime || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{service.lastChecked || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{service.lastError || "-"}</td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "workers" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.workers", "Workers")}</h3>
              <Button size="sm" onClick={() => setShowRegisterWorker(true)}>
                <Plus className="mr-2 size-4" />
                {t("admin.devops.registerWorker", "Register Worker")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.workerName", "Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.workerType", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.workerStatus", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.workerPid", "PID")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.started", "Started")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.lastHeartbeat", "Last Heartbeat")}</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker: any) => (
                    <tr key={worker.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{worker.name}</td>
                      <td className="py-3 text-muted-foreground">{worker.type}</td>
                      <td className="py-3"><StatusBadge status={worker.status} /></td>
                      <td className="py-3 text-muted-foreground font-mono text-xs">{worker.pid || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{worker.startedAt || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{worker.lastHeartbeat || "-"}</td>
                    </tr>
                  ))}
                  {workers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("admin.devops.noWorkers", "No workers registered")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showRegisterWorker && (
            <DashboardCard title={t("admin.devops.registerWorker", "Register Worker")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("admin.devops.workerName", "Name")}</Label>
                  <Input
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    placeholder="worker-1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("admin.devops.workerType", "Type")}</Label>
                  <select
                    value={newWorker.type}
                    onChange={(e) => setNewWorker({ ...newWorker, type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="background">Background</option>
                    <option value="queue">Queue</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowRegisterWorker(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleRegisterWorker}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "releases" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.devops.releases", "Releases")}</h3>
              <Button size="sm" onClick={() => setShowCreateRelease(true)}>
                <Plus className="mr-2 size-4" />
                {t("admin.devops.createRelease", "Create Release")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.releaseVersion", "Version")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.releaseName", "Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.created", "Created")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.published", "Published")}</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((release: any) => (
                    <tr key={release.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{release.version}</td>
                      <td className="py-3 text-muted-foreground">{release.name}</td>
                      <td className="py-3"><StatusBadge status={release.status} /></td>
                      <td className="py-3 text-muted-foreground text-xs">{release.createdAt}</td>
                      <td className="py-3 text-muted-foreground text-xs">{release.publishedAt || "-"}</td>
                    </tr>
                  ))}
                  {releases.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("admin.devops.noReleases", "No releases published")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateRelease && (
            <DashboardCard title={t("admin.devops.createRelease", "Create Release")}>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{t("admin.devops.releaseVersion", "Version")}</Label>
                    <Input
                      value={newRelease.version}
                      onChange={(e) => setNewRelease({ ...newRelease, version: e.target.value })}
                      placeholder="1.0.0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t("admin.devops.releaseName", "Name")}</Label>
                    <Input
                      value={newRelease.name}
                      onChange={(e) => setNewRelease({ ...newRelease, name: e.target.value })}
                      placeholder="Production Release"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t("admin.devops.releaseNotes", "Release Notes")}</Label>
                  <textarea
                    value={newRelease.notes}
                    onChange={(e) => setNewRelease({ ...newRelease, notes: e.target.value })}
                    placeholder="Release notes..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateRelease(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateRelease}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "backups" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.devops.backups", "Backups")}</h3>
              <Button size="sm" onClick={handleCreateBackup}>
                <Plus className="mr-2 size-4" />
                {t("admin.devops.createBackup", "Create Backup")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.backupName", "Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.backupType", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.backupStatus", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.backupSize", "Size")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.devops.created", "Created")}</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup: any) => (
                    <tr key={backup.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{backup.name}</td>
                      <td className="py-3 text-muted-foreground">{backup.type}</td>
                      <td className="py-3"><StatusBadge status={backup.status} /></td>
                      <td className="py-3 text-muted-foreground">{backup.size || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{backup.createdAt}</td>
                    </tr>
                  ))}
                  {backups.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("admin.devops.noBackups", "No backups created")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
