import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { productionStore } from "@/features/production/production.store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const job = productionStore.get(params.id);
  return { title: job ? `${job.name} - Production - Tamer Studio` : "Production - Tamer Studio" };
}

export default function ProductionDetailPage({ params }: { params: { id: string } }) {
  const job = productionStore.get(params.id);

  if (!job) {
    return (
      <AppShell>
        <PageLayout title="Production" description="Production pipeline and queues." breadcrumb={[{ label: "Production", href: "/production" }, { label: "Detail" }]}>
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">Production job not found.</div>
        </PageLayout>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageLayout title={job.name} description={job.workflowName} breadcrumb={[{ label: "Production", href: "/production" }, { label: job.id }]}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{job.name}</CardTitle>
                <CardDescription>{job.workflowName}</CardDescription>
              </div>
              <Badge tone={job.status === "Completed" ? "success" : job.status === "Running" ? "info" : job.status === "Failed" ? "warning" : "muted"}>
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project</p>
                <p className="mt-2 font-medium">{job.project}</p>
              </div>
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
                <p className="mt-2 font-medium">{job.workspace}</p>
              </div>
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner</p>
                <p className="mt-2 font-medium">{job.owner}</p>
              </div>
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Priority</p>
                <p className="mt-2 font-medium">{job.priority}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold">Progress</p>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>{job.currentStep}</span>
                <span>{job.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/40">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${job.progress}%` }} />
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold">Execution log</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {job.executionLog.map((log, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs">•</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    </AppShell>
  );
}