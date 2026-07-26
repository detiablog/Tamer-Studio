"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Activity, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type ProviderHealth = {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "warning" | "offline";
  latency: number;
  lastCheck: string;
  errorInfo: string;
  uptime: number;
};

const MOCK_HEALTH_DATA: ProviderHealth[] = [
  { id: "smtp", name: "SMTP", type: "smtp", status: "healthy", latency: 45, lastCheck: new Date().toISOString(), errorInfo: "", uptime: 99.9 },
  { id: "sendgrid", name: "SendGrid", type: "sendgrid", status: "healthy", latency: 120, lastCheck: new Date().toISOString(), errorInfo: "", uptime: 99.8 },
  { id: "resend", name: "Resend", type: "resend", status: "warning", latency: 350, lastCheck: new Date().toISOString(), errorInfo: "Slow response time", uptime: 98.5 },
  { id: "amazonses", name: "Amazon SES", type: "amazonses", status: "healthy", latency: 80, lastCheck: new Date().toISOString(), errorInfo: "", uptime: 99.99 },
  { id: "mailgun", name: "Mailgun", type: "mailgun", status: "offline", latency: 0, lastCheck: new Date().toISOString(), errorInfo: "Connection refused", uptime: 0 },
  { id: "postmark", name: "Postmark", type: "postmark", status: "healthy", latency: 60, lastCheck: new Date().toISOString(), errorInfo: "", uptime: 100 },
  { id: "brevo", name: "Brevo", type: "brevo", status: "warning", latency: 280, lastCheck: new Date().toISOString(), errorInfo: "Rate limit approaching", uptime: 97.2 },
  { id: "sparkpost", name: "SparkPost", type: "sparkpost", status: "healthy", latency: 95, lastCheck: new Date().toISOString(), errorInfo: "", uptime: 99.95 },
];

function StatusDot({ status }: { status: ProviderHealth["status"] }) {
  const cls = {
    healthy: "bg-green-500",
    warning: "bg-amber-500",
    offline: "bg-red-500",
  }[status];
  return <span className={cn("inline-block size-2.5 rounded-full", cls)} />;
}

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-border bg-card p-4">
    <div className="h-4 w-24 bg-muted rounded mb-3" />
    <div className="h-3 w-16 bg-muted rounded mb-2" />
    <div className="h-3 w-40 bg-muted rounded" />
  </div>
);

export default function HealthPage() {
  const { t } = useLocalizationContext();
  const [providers, setProviders] = React.useState<ProviderHealth[]>(MOCK_HEALTH_DATA);
  const [loading, setLoading] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState(Date.now());

  const fetchHealth = () => {
    setLoading(true);
    fetch("/api/admin/email/health")
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch health");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProviders(data);
        }
      })
      .catch(() => toast.error(t("email.healthFetchFailed")))
      .finally(() => {
        setLoading(false);
        setLastRefresh(Date.now());
      });
  };

  React.useEffect(() => {
    fetchHealth();
  }, []);

  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualCheck = () => {
    fetchHealth();
    toast.info(t("email.healthCheckTriggered"));
  };

  const statusBadge: Record<string, "success" | "warning" | "default"> = {
    healthy: "success",
    warning: "warning",
    offline: "default",
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.health") }]} />
      <PageHeader
        title={t("email.health")}
        description={t("email.healthDescription")}
        actions={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={e => setAutoRefresh(e.target.checked)}
                className="rounded border-border"
              />
              {t("email.autoRefresh")}
            </label>
            <Button onClick={handleManualCheck} disabled={loading}>
              <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
              {t("email.checkNow")}
            </Button>
          </div>
        }
      />

      {loading && providers.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {t("email.lastChecked")}: {new Date(lastRefresh).toLocaleTimeString()}
            {autoRefresh && <span className="ml-2 text-xs text-green-600">{t("email.autoRefreshActive")}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map(provider => (
              <DashboardCard key={provider.id}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusDot status={provider.status} />
                  <h3 className="font-heading font-semibold text-sm">{provider.name}</h3>
                  <Badge tone={statusBadge[provider.status]}>
                    {provider.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("email.latency")}</span>
                    <span className={cn(
                      "font-medium",
                      provider.latency > 300 ? "text-destructive" :
                      provider.latency > 150 ? "text-amber-600" : "text-foreground"
                    )}>
                      {provider.latency > 0 ? `${provider.latency}ms` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("email.uptime")}</span>
                    <span className="font-medium">{provider.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("email.lastCheck")}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(provider.lastCheck).toLocaleTimeString()}
                    </span>
                  </div>
                  {provider.errorInfo && (
                    <div className="flex items-start gap-1.5 text-xs text-destructive mt-1">
                      <AlertTriangle className="size-3 shrink-0 mt-0.5" />
                      <span>{provider.errorInfo}</span>
                    </div>
                  )}
                </div>
              </DashboardCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}