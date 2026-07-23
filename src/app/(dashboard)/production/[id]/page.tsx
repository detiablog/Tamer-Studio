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
import { estimateExecutionTime } from "@/core/production/execution";

export default function ProductionDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = React.useState<ReturnType<typeof productionStore.get> | null>(null);
  const [content, setContent] = React.useState("");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionResult, setExecutionResult] = React.useState<any>(null);
  const [userToken, setUserToken] = React.useState<string>("");
  const [workspaceId, setWorkspaceId] = React.useState<string>("");

  React.useEffect(() => {
    const loadedJob = productionStore.get(params.id);
    setJob(loadedJob);
    if (loadedJob?.name) {
      document.title = `${loadedJob.name} - Production - Tamer Studio`;
      setContent(`Workflow: ${loadedJob.workflowName}\nProject: ${loadedJob.project}\nStatus: ${loadedJob.status}`);
      setWorkspaceId(loadedJob.workspace);
    }
    // In real app, get token from session
    setUserToken("mock-token-" + Math.random().toString(36).slice(2));
  }, [params.id]);

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
          userId: "user-123", // In real app, get from session
          aiModel: "gpt-4",
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
        toast.success("Production executed successfully!");
      } else {
        toast.error(data.error || "Production execution failed");
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Failed to execute production");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRetry = () => {
    const retried = productionStore.retry(params.id);
    if (retried) {
      setJob(retried);
      setExecutionResult(null);
      toast.success("Production queued for retry");
    }
  };

  const handleDuplicate = () => {
    if (!job) return;
    const duplicated = productionStore.duplicate(job.id);
    if (duplicated) {
      toast.success(`Duplicated as "${duplicated.name}"`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  };

  if (!job) {
    return (
      <AppShell>
        <PageLayout
          title="Production"
          description="Production pipeline and queues."
          breadcrumb={[{ label: "Production", href: "/production" }, { label: "Detail" }]}
        >
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Production job not found.
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
          { label: "Production", href: "/production" },
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
              <Badge tone="muted">{job.priority} Priority</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.status === "Failed" && (
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RotateCcw className="mr-2 size-4" />
                  Retry
                </Button>
              )}
              {(job.status === "Draft" || job.status === "Queued") && (
                <Button
                  onClick={handleExecuteProduction}
                  disabled={isExecuting}
                  size="sm"
                >
                  <Play className="mr-2 size-4" />
                  {isExecuting ? "Executing..." : "Execute"}
                </Button>
              )}
              <Button onClick={handleDuplicate} variant="outline" size="sm">
                <Copy className="mr-2 size-4" />
                Duplicate
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Collaborative Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Production Content</CardTitle>
                  <CardDescription>Collaborate with your team on production details</CardDescription>
                </CardHeader>
                <CardContent>
                  <CollaborativeProductionEditor
                    productionId={job.id}
                    workspaceId={workspaceId}
                    token={userToken}
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
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Details Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Project</p>
                    <p className="font-medium">{job.project}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Workspace</p>
                    <p className="font-medium">{job.workspace}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Owner</p>
                    <p className="font-medium">{job.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated Duration</p>
                    <p className="font-medium">{estimateExecutionTime(job.workflowType)}</p>
                  </div>
                  {job.startedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Started</p>
                      <p className="font-medium text-sm">
                        {new Date(job.startedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {job.finishedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Finished</p>
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
                    <CardTitle className="text-base">Execution Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {(executionResult.executionTimeMs / 1000).toFixed(2)}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input Tokens:</span>
                      <span className="font-medium">{executionResult.inputTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Output Tokens:</span>
                      <span className="font-medium">{executionResult.outputTokens}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Cost:</span>
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
                  <CardTitle className="text-base">Progress</CardTitle>
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
                <CardTitle>Execution Log</CardTitle>
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
