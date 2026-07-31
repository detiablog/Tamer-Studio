"use client";

import * as React from "react";
import useSWR from "swr";
import { CollaborativeProductionEditor } from "@/components/production/CollaborativeProductionEditor";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Copy, Download, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { estimateExecutionTime } from "@/core/production/estimates";
import { useLocalizationContext } from "@/providers/localization";
import { authClient } from "@/core/auth/client";
import { logger } from "@/core/logger";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface JobDetail {
  id: string;
  type: string;
  status: string;
  progress: number;
  payload: { type: string; data: Record<string, unknown> };
  priority: string;
  attempts: number;
  maxAttempts: number;
  workspaceId: string;
  ownerId: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { t } = useLocalizationContext();
  const { data: session } = authClient.useSession();
  const [content, setContent] = React.useState("");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<any>(null);

  const { data, error, isLoading } = useSWR<JobDetail>("/api/jobs/" + id, fetcher);

  const job = data && "id" in data ? data : null;

  React.useEffect(() => {
    if (job) {
      document.title = `${String(job.payload?.data?.name ?? job.type)} - ${t("dashboard.production")} - ${t("brand.name")}`;
      setContent(`${t("production.workflow")}: ${job.type}\n${t("common.status")}: ${job.status}`);
    }
  }, [job, t]);

  const handleExecuteProduction = async () => {
    if (!job) return;

    setIsExecuting(true);
    try {
      const response = await fetch("/api/production/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-workspace-id": job.workspaceId },
        body: JSON.stringify({
          productionId: job.id,
          workspaceId: job.workspaceId,
          userId: session?.user?.id ?? "",
          aiModel: job.type === "audio_generation" ? "wavesynth-sound-1" : "tamer-pro-1",
          workflowType: job.type,
          prompt: content,
          parameters: { quality: "high", format: "standard" },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExecutionResult(result.result);
        toast.success(t("production.detail.executionSuccess", "Production executed successfully!"));
      } else {
        toast.error(result.error || t("production.detail.executionFailed", "Production execution failed"));
      }
    } catch (err) {
      logger.error("Execution error", err instanceof Error ? err : new Error(String(err)));
      toast.error(t("production.detail.executeFailed", "Failed to execute production"));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRetry = async () => {
    if (!job) return;
    try {
      await fetch("/api/jobs/" + job.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "pending" }) });
      toast.success(t("production.detail.queuedForRetry", "Production queued for retry"));
      window.location.reload();
    } catch {
      toast.error(t("production.failedToRetry", "Failed to retry"));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success(t("production.detail.copiedToClipboard", "Content copied to clipboard"));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">{t("common.loading")}</div>;
  }

  if (error || !job) {
    return (
      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        {t("production.detail.notFound", "Production job not found.")}
      </div>
    );
  }

  const mappedStatus = job.status === "completed" ? "Completed" : job.status === "processing" ? "Running" : job.status === "failed" ? "Failed" : job.status === "cancelled" ? "Cancelled" : "Queued";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            tone={mappedStatus === "Completed" ? "success" : mappedStatus === "Running" ? "info" : mappedStatus === "Failed" ? "warning" : "muted"}
          >
            {mappedStatus}
          </Badge>
          <Badge tone="info">{job.type}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {job.status === "failed" && (
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RotateCcw className="mr-2 size-4" />
              {t("production.detail.retry", "Retry")}
            </Button>
          )}
          {(job.status === "pending" || job.status === "queued") && (
            <Button onClick={handleExecuteProduction} disabled={isExecuting} size="sm">
              <Play className="mr-2 size-4" />
              {isExecuting ? t("production.detail.executing", "Executing...") : t("production.detail.execute", "Execute")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("production.detail.productionContent", "Production Content")}</CardTitle>
              <CardDescription>{t("production.detail.collaborateDescription", "Collaborate with your team on production details")}</CardDescription>
            </CardHeader>
            <CardContent>
              <CollaborativeProductionEditor
                productionId={job.id}
                workspaceId={job.workspaceId}
                content={content}
                onContentChange={setContent}
              />
              <Button onClick={handleCopy} variant="ghost" size="sm" className="mt-3">
                <Download className="mr-2 size-4" />
                {t("production.detail.copyToClipboard", "Copy to Clipboard")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("production.detail.details", "Details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("production.detail.type", "Type")}</p>
                <p className="font-medium">{job.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("production.detail.estimatedDuration", "Estimated Duration")}</p>
                <p className="font-medium">{estimateExecutionTime(job.type)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("production.detail.attempts", "Attempts")}</p>
                <p className="font-medium">{job.attempts} / {job.maxAttempts}</p>
              </div>
              {job.startedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("production.detail.started", "Started")}</p>
                  <p className="font-medium text-sm">{new Date(job.startedAt).toLocaleString()}</p>
                </div>
              )}
              {job.completedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">{t("production.detail.finished", "Finished")}</p>
                  <p className="font-medium text-sm">{new Date(job.completedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">{t("production.detail.createdAt", "Created")}</p>
                <p className="font-medium text-sm">{new Date(job.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {executionResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("production.detail.executionResult", "Execution Result")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("production.detail.time", "Time:")}</span>
                  <span className="font-medium">{(executionResult.executionTimeMs / 1000).toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("production.detail.inputTokens", "Input Tokens:")}</span>
                  <span className="font-medium">{executionResult.inputTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("production.detail.outputTokens", "Output Tokens:")}</span>
                  <span className="font-medium">{executionResult.outputTokens}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">{t("production.detail.cost", "Cost:")}</span>
                  <span className="font-medium text-green-600">${executionResult.costUsd}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("production.detail.progress", "Progress")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{mappedStatus}</span>
                <span className="font-medium">{job.progress}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
