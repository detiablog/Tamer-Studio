"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { productionStore } from "@/features/production/production.store";
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

export default function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { t } = useLocalizationContext();
  const { data: session } = authClient.useSession();
  const [job, setJob] = React.useState<ReturnType<typeof productionStore.get> | null>(null);
  const [content, setContent] = React.useState("");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<any>(null);
  const [workspaceId, setWorkspaceId] = React.useState<string>("");

  React.useEffect(() => {
    const loadedJob = productionStore.get(id);
    setJob(loadedJob);
    if (loadedJob?.name) {
      document.title = `${loadedJob.name} - ${t("dashboard.production")} - ${t("brand.name")}`;
      setContent(`${t("production.workflow")}: ${loadedJob.workflowName}\n${t("production.project")}: ${loadedJob.project}\n${t("common.status")}: ${loadedJob.status}`);
      setWorkspaceId(loadedJob.workspace);
    }
  }, [id, t]);

  const handleExecuteProduction = async () => {
    if (!job) return;

    setIsExecuting(true);
    try {
      const response = await fetch("/api/production/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-workspace-id": workspaceId,
        },
        body: JSON.stringify({
          productionId: job.id,
          workspaceId: workspaceId,
          userId: session?.user?.id ?? "",
          // TODO: resolve the correct model from the workspace provider config instead of hardcoding
          aiModel: job.workflowType === "Audio Generation" ? "wavesynth-sound-1" : "tamer-pro-1",
          workflowType: job.workflowType,
          prompt: content,
          parameters: {
            quality: "high",
            format: "standard",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExecutionResult(data.result);
        // Update job status
        const updated = productionStore.update(job.id, {
          status: "Completed",
          progress: 100,
          finishedAt: new Date().toISOString(),
          executionLog: [
            ...job.executionLog,
            `Executed with ${data.result.aiModel}`,
            `Cost: $${data.result.costUsd}`,
            `Tokens: ${data.result.inputTokens} input, ${data.result.outputTokens} output`,
          ],
        });
        setJob(updated);
        toast.success(t("production.detail.executionSuccess", "Production executed successfully!"));
      } else {
        toast.error(data.error || t("production.detail.executionFailed", "Production execution failed"));
      }
    } catch (error) {
      logger.error("Execution error", error instanceof Error ? error : new Error(String(error)));
      toast.error(t("production.detail.executeFailed", "Failed to execute production"));
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRetry = () => {
    const retried = productionStore.retry(id);
    if (retried) {
      setJob(retried);
      setExecutionResult(null);
      toast.success(t("production.detail.queuedForRetry", "Production queued for retry"));
    }
  };

  const handleDuplicate = () => {
    if (!job) return;
    const duplicated = productionStore.duplicate(job.id);
    if (duplicated) {
      toast.success(t("production.detail.duplicated", 'Duplicated as "{0}"').replace("{0}", duplicated.name));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success(t("production.detail.copiedToClipboard", "Content copied to clipboard"));
  };

  if (!job) {
    return (
      <AppShell>
        <PageLayout
          title={t("production.detail.pageTitle", "Production")}
          description={t("production.detail.productionPipeline", "Production pipeline and queues.")}
          breadcrumb={[{ label: t("dashboard.production"), href: "/production" }, { label: "Detail" }]}
        >
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            {t("production.detail.notFound", "Production job not found.")}
          </div>
        </PageLayout>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageLayout
        title={job.name}
        description={job.workflowName}
        breadcrumb={[
          { label: t("dashboard.production"), href: "/production" },
          { label: job.id },
        ]}
      >
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                tone={
                  job.status === "Completed"
                    ? "success"
                    : job.status === "Running"
                    ? "info"
                    : job.status === "Failed"
                    ? "warning"
                    : "muted"
                }
              >
                {job.status}
              </Badge>
              <Badge tone="info">{job.workflowType}</Badge>
              <Badge tone="muted">{job.priority} {t("production.priority")}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.status === "Failed" && (
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RotateCcw className="mr-2 size-4" />
                  {t("production.detail.retry", "Retry")}
                </Button>
              )}
              {(job.status === "Draft" || job.status === "Queued") && (
                <Button
                  onClick={handleExecuteProduction}
                  disabled={isExecuting}
                  size="sm"
                >
                  <Play className="mr-2 size-4" />
                  {isExecuting ? t("production.detail.executing", "Executing...") : t("production.detail.execute", "Execute")}
                </Button>
              )}
              <Button onClick={handleDuplicate} variant="outline" size="sm">
                <Copy className="mr-2 size-4" />
                {t("production.detail.duplicate", "Duplicate")}
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Collaborative Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("production.detail.productionContent", "Production Content")}</CardTitle>
                  <CardDescription>{t("production.detail.collaborateDescription", "Collaborate with your team on production details")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CollaborativeProductionEditor
                    productionId={job.id}
                    workspaceId={workspaceId}
                    content={content}
                    onContentChange={setContent}
                  />
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                  >
                    <Download className="mr-2 size-4" />
                    {t("production.detail.copyToClipboard", "Copy to Clipboard")}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Details Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("production.detail.details", "Details")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("production.detail.project", "Project")}</p>
                    <p className="font-medium">{job.project}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("production.detail.workspace", "Workspace")}</p>
                    <p className="font-medium">{job.workspace}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("production.detail.owner", "Owner")}</p>
                    <p className="font-medium">{job.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("production.detail.estimatedDuration", "Estimated Duration")}</p>
                    <p className="font-medium">{estimateExecutionTime(job.workflowType)}</p>
                  </div>
                  {job.startedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("production.detail.started", "Started")}</p>
                      <p className="font-medium text-sm">
                        {new Date(job.startedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {job.finishedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t("production.detail.finished", "Finished")}</p>
                      <p className="font-medium text-sm">
                        {new Date(job.finishedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Result */}
              {executionResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("production.detail.executionResult", "Execution Result")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("production.detail.time", "Time:")}</span>
                      <span className="font-medium">
                        {(executionResult.executionTimeMs / 1000).toFixed(2)}s
                      </span>
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
                      <span className="font-medium text-green-600">
                        ${executionResult.costUsd}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("production.detail.progress", "Progress")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{job.currentStep}</span>
                    <span className="font-medium">{job.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Execution Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t("production.detail.executionLog", "Execution Log")}</CardTitle>
                <MessageSquare className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {job.executionLog.map((log, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{log}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </AppShell>
  );
}
