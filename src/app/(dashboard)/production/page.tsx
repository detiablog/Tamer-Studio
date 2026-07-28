"use client";

import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pause, RotateCcw, Play } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"
import { productionStore, type ProductionJob } from "@/features/production/production.store"

export default function ProductionPage() {
  const { t } = useLocalizationContext();
  const [jobs, setJobs] = React.useState<ProductionJob[]>([]);

  React.useEffect(() => {
    setJobs(productionStore.getAll());
  }, []);

  const running = jobs.filter((j) => j.status === "Running" || j.status === "Waiting").length;
  const completed = jobs.filter((j) => j.status === "Completed").length;
  const failed = jobs.filter((j) => j.status === "Failed").length;
  const queued = jobs.filter((j) => j.status === "Queued").length;

  return (
    <AppShell>
      <PageLayout title={t("dashboard.production")} description={t("dashboard.productionPipelineDesc")} breadcrumb={[{ label: t("dashboard.production") }]} actions={<ActionButton>{t("dashboard.newJob")}</ActionButton>}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("production.totalJobs", "Total Jobs")} value={jobs.length} delta={t("production.activeCount").replace("{count}", String(running))} />
            <StatCard title={t("production.running", "Running")} value={running} delta={t("production.queuedCount").replace("{count}", String(queued))} />
            <StatCard title={t("production.completed", "Completed")} value={completed} delta={jobs.length > 0 ? `${Math.round((completed / jobs.length) * 100)}% ${t("common.success")}` : t("common.none")} />
            <StatCard title={t("production.failed", "Failed")} value={failed} delta={failed > 0 ? t("production.retryAvailable") : t("common.none")} />
          </div>

          <DashboardCard title={t("dashboard.productionPipeline")} description={t("production.monitorAndManage", "Monitor and manage your production jobs")}>
            <div className="space-y-3">
              {jobs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">{t("production.empty")}</p>
              )}
              {jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{job.name}</h4>
                      <Badge tone={
                        job.status === "Running" || job.status === "Waiting" ? "info" :
                        job.status === "Completed" ? "success" :
                        job.status === "Failed" ? "warning" :
                        job.status === "Queued" ? "muted" : "default"
                      }>
                        {job.status}
                      </Badge>
                      <Badge tone={job.priority === "High" || job.priority === "Critical" ? "warning" : job.priority === "Medium" ? "info" : "muted"}>
                        {job.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{job.workflowType} • {job.project}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {job.status === "Running" && (
                      <Button variant="ghost" size="icon" className="size-8">
                        <Pause className="size-4" />
                      </Button>
                    )}
                    {job.status === "Failed" && (
                      <Button variant="ghost" size="icon" className="size-8">
                        <RotateCcw className="size-4" />
                      </Button>
                    )}
                    {job.status === "Queued" && (
                      <Button variant="ghost" size="icon" className="size-8">
                        <Play className="size-4" />
                      </Button>
                    )}
                    <Link href={`/production/${job.id}`} className="text-sm text-primary hover:underline">{t("common.view")}</Link>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </PageLayout>
    </AppShell>
  )
}
