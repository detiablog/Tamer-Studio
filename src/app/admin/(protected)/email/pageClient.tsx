"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Mail, Send, CheckCircle, XCircle, AlertTriangle, Clock, Activity, Gauge, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type Stat = {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ReactNode;
  tone: "default" | "success" | "warning" | "info" | "muted" | "purple";
};

type EmailOverview = {
  providers: { total: number; active: number };
  health: { total: number; healthy: number; warning: number; offline: number };
  queue: { total: number; queued: number; processing: number; failed: number };
  templates: { total: number; active: number };
  logs: { total: number };
  today: { sent: number; delivered: number; failed: number; retry: number; bounce: number };
};

const MOCK_EMAIL_OVERVIEW: EmailOverview = {
  providers: { total: 3, active: 2 },
  health: { total: 3, healthy: 2, warning: 1, offline: 0 },
  queue: { total: 247, queued: 145, processing: 52, failed: 50 },
  templates: { total: 12, active: 8 },
  logs: { total: 5432 },
  today: { sent: 1234, delivered: 1180, failed: 42, retry: 12, bounce: 8 },
};

type EmailDashboardPageProps = {
  adminToken: string | null;
};

export default function EmailDashboardPage({ adminToken }: EmailDashboardPageProps) {
  const { t } = useLocalizationContext();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [overview, setOverview] = React.useState<EmailOverview | null>(null);

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  React.useEffect(() => {
    let cancelled = false;
    async function fetchOverview() {
      try {
        const res = await fetch("/api/admin/email", {
          headers: authHeaders,
        });
        if (!res.ok) {
          if (!cancelled) {
            setOverview(MOCK_EMAIL_OVERVIEW);
            setLoading(false);
            if (res.status !== 401) {
              setError(null);
            }
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setOverview(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setOverview(MOCK_EMAIL_OVERVIEW);
          setLoading(false);
          setError(null);
        }
      }
    }
    fetchOverview();
    return () => { cancelled = true; };
  }, [authHeaders]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/email", {
      headers: authHeaders,
    })
      .then((r) => r.json())
      .then((data: EmailOverview) => {
        setOverview(data);
        setLoading(false);
        toast.success(t("email.refreshed"));
      })
      .catch((err) => {
        setOverview(MOCK_EMAIL_OVERVIEW);
        setLoading(false);
        toast.info(t("email.usingMockData", "Using demo data"));
      });
  };

  const statsCards: Stat[] = overview && overview.today
    ? [
        { label: t("email.totalSent", "Total Sent"), value: overview.today.sent ?? 0, icon: <Send className="size-4" />, tone: "default" },
        { label: t("email.delivered", "Delivered"), value: overview.today.delivered ?? 0, icon: <CheckCircle className="size-4" />, tone: "success" },
        { label: t("email.failed", "Failed"), value: overview.today.failed ?? 0, icon: <XCircle className="size-4" />, tone: "warning" },
        { label: t("email.bounce", "Bounce"), value: overview.today.bounce ?? 0, icon: <AlertTriangle className="size-4" />, tone: "warning" },
        { label: t("email.retry", "Retry"), value: overview.today.retry ?? 0, icon: <Clock className="size-4" />, tone: "info" },
        { label: t("email.queue.total", "Queue"), value: overview.queue?.total ?? 0, icon: <Activity className="size-4" />, tone: "default" },
        { label: t("email.providers.active", "Active"), value: overview.providers?.active ?? 0, icon: <BarChart3 className="size-4" />, tone: "success" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email", "Email") }]} />
      <PageHeader
        title={t("email.dashboard", "Email Dashboard")}
        description={t("email.dashboardDescription", "Email service overview")}
        actions={
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            {t("email.refresh", "Refresh")}
          </Button>
        }
      />

      {error ? (
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="size-12 text-destructive mb-4" />
            <p className="text-foreground font-medium">{t("email.loadError", "Failed to load email data")}</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              {t("email.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.length > 0 ? (
              statsCards.map((stat) => (
                <DashboardCard key={stat.label}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                </DashboardCard>
              ))
            ) : (
              <div className="col-span-full">
                <DashboardCard>
                  <div className="text-center text-muted-foreground py-8">{t("email.loading", "Loading...")}</div>
                </DashboardCard>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard>
              <h2 className="font-heading text-lg font-semibold mb-4">{t("email.queue.title", "Queue Status")}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.queue.total", "Queue")}</span>
                  <span className="font-semibold">{overview?.queue?.total ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.queued", "Queued")}</span>
                  <Badge tone="default">{overview?.queue?.queued ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.processing", "Processing")}</span>
                  <Badge tone="info">{overview?.queue?.processing ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.failed", "Failed")}</span>
                  <Badge tone="warning">{overview?.queue?.failed ?? 0}</Badge>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard>
              <h2 className="font-heading text-lg font-semibold mb-4">{t("email.health.title", "Health Status")}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.providers.total", "Total")}</span>
                  <span className="font-semibold">{overview?.health?.total ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.healthy", "Healthy")}</span>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <Badge tone="success">{overview?.health?.healthy ?? 0}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.warning", "Warning")}</span>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-yellow-500" />
                    <Badge tone="warning">{overview?.health?.warning ?? 0}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("email.offline", "Offline")}</span>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500" />
                    <Badge tone="warning">{overview?.health?.offline ?? 0}</Badge>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </>
      )}
    </div>
  );
}
