"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Mail, Clock, RotateCcw, XCircle, Play, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type QueueEntry = {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: "queued" | "processing" | "sent" | "failed" | "cancelled";
  attempts: number;
  provider: string;
  createdAt: string;
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-3 w-16 bg-muted rounded" /></td>
    <td className="px-4 py-3"><div className="h-3 w-24 bg-muted rounded" /></td>
    <td className="px-4 py-3"><div className="h-3 w-32 bg-muted rounded" /></td>
    <td className="px-4 py-3"><div className="h-3 w-40 bg-muted rounded" /></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-muted rounded" /></td>
    <td className="px-4 py-3"><div className="h-3 w-12 bg-muted rounded" /></td>
    <td className="px-4 py-3"><div className="h-3 w-16 bg-muted rounded" /></td>
  </tr>
);

type QueuePageProps = {
  adminToken: string | null;
};

export default function QueuePage({ adminToken }: QueuePageProps) {
  const { t } = useLocalizationContext();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [queueData, setQueueData] = React.useState<{ depth: number; entries: QueueEntry[] } | null>(null);

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/email/queue", {
      headers: authHeaders,
    })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load queue");
        return r.json();
      })
      .then(data => {
        setQueueData(data);
        setError(null);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load queue"))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRetry = (id: string) => {
    setQueueData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.map(e => (e.id === id ? { ...e, status: "queued" as const, attempts: e.attempts + 1 } : e)),
      };
    });
    fetch(`/api/admin/email/queue/${id}/retry`, { method: "POST", headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success(t("email.retrySuccess"));
        } else {
          toast.error(data.error || t("email.retryFailed"));
        }
      })
      .catch(() => toast.error(t("email.retryFailed")));
  };

  const handleCancel = (id: string) => {
    setQueueData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.map(e => (e.id === id ? { ...e, status: "cancelled" as const } : e)),
      };
    });
    fetch(`/api/admin/email/queue/${id}/cancel`, { method: "POST", headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success(t("email.cancelled"));
        } else {
          toast.error(data.error || t("email.cancelFailed"));
        }
      })
      .catch(() => toast.error(t("email.cancelFailed")));
  };

  const statusToneMap: Record<string, "default" | "info" | "success" | "warning" | "muted"> = {
    queued: "info",
    processing: "default",
    sent: "success",
    failed: "warning",
    cancelled: "muted",
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.queue") }]} />
      <PageHeader
        title={t("email.queue")}
        description={t("email.queueDescription")}
        actions={
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            {t("email.refresh")}
          </Button>
        }
      />

      {error ? (
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="size-12 text-destructive mb-4" />
            <p className="text-foreground font-medium">{t("email.loadError")}</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
        </DashboardCard>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardCard>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Mail className="size-4" />
                {t("email.queueDepth")}
              </div>
              <div className="text-2xl font-semibold">
                {queueData ? queueData.depth : "—"}
              </div>
            </DashboardCard>
            <DashboardCard>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="size-4" />
                {t("email.processing")}
              </div>
              <div className="text-2xl font-semibold">
                {queueData
                  ? queueData.entries.filter(e => e.status === "processing").length
                  : "—"}
              </div>
            </DashboardCard>
            <DashboardCard>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Play className="size-4" />
                {t("email.queued")}
              </div>
              <div className="text-2xl font-semibold">
                {queueData
                  ? queueData.entries.filter(e => e.status === "queued").length
                  : "—"}
              </div>
            </DashboardCard>
          </div>

          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold">{t("email.queueEntries")}</h2>
              <Badge tone="info">{queueData?.entries.length ?? 0} {t("email.entries")}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.id")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.type")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.recipient")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.subject")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.status")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.attempts")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.provider")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.createdAt")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : !queueData || queueData.entries.length === 0
                      ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                            {t("email.noQueueEntries")}
                          </td>
                        </tr>
                      )
                      : queueData.entries.map(entry => (
                        <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs">{entry.id}</td>
                          <td className="px-4 py-3">{entry.type}</td>
                          <td className="px-4 py-3">{entry.recipient}</td>
                          <td className="px-4 py-3 max-w-xs truncate">{entry.subject}</td>
                          <td className="px-4 py-3">
                            <Badge tone={statusToneMap[entry.status] ?? "default"}>{entry.status}</Badge>
                          </td>
                          <td className="px-4 py-3">{entry.attempts}</td>
                          <td className="px-4 py-3">{entry.provider}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{entry.createdAt}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {entry.status === "failed" && (
                                <Button variant="outline" size="sm" onClick={() => handleRetry(entry.id)}>
                                  <RotateCcw className="mr-1 size-3" />
                                  {t("email.retry")}
                                </Button>
                              )}
                              {entry.status !== "cancelled" && entry.status !== "sent" && (
                                <Button variant="destructive" size="sm" onClick={() => handleCancel(entry.id)}>
                                  <XCircle className="mr-1 size-3" />
                                  {t("email.cancel")}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </>
      )}
    </div>
  );
}
