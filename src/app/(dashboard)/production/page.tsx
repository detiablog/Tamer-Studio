"use client";

import * as React from "react"
import useSWR from "swr"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pause, RotateCcw, Play } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Job {
  id: string;
  type: string;
  payload: { type: string; data: Record<string, unknown> };
  status: "pending" | "queued" | "processing" | "completed" | "failed" | "cancelled";
  priority: "low" | "normal" | "high";
  progress: number;
  attempts: number;
  maxAttempts: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

function mapStatus(status: Job["status"]): string {
  const map: Record<string, string> = {
    pending: "Queued",
    queued: "Queued",
    processing: "Running",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

function mapPriority(priority: Job["priority"]): string {
  const map: Record<string, string> = {
    low: "Low",
    normal: "Medium",
    high: "High",
  };
  return map[priority] ?? priority;
}

function statusBadgeTone(status: Job["status"]) {
  if (status === "processing") return "info";
  if (status === "completed") return "success";
  if (status === "failed") return "warning";
  return "muted";
}

function priorityBadgeTone(priority: Job["priority"]) {
  if (priority === "high") return "warning";
  if (priority === "normal") return "info";
  return "muted";
}

export default function ProductionPage() {
  const { t } = useLocalizationContext();
  const { data, isLoading } = useSWR("/api/jobs", fetcher, { refreshInterval: 5000 });

  const jobs: Job[] = data?.jobs ?? [];
  const running = jobs.filter((j) => j.status === "processing").length;
  const completed = jobs.filter((j) => j.status === "completed").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const queued = jobs.filter((j) => j.status === "queued" || j.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("production.totalJobs", "Total Jobs")} value={jobs.length} delta={t("production.activeCount").replace("{count}", String(running))} />
        <StatCard title={t("production.running", "Running")} value={running} delta={t("production.queuedCount").replace("{count}", String(queued))} />
        <StatCard title={t("production.completed", "Completed")} value={completed} delta={jobs.length > 0 ? `${Math.round((completed / jobs.length) * 100)}% ${t("common.success")}` : t("common.none")} />
        <StatCard title={t("production.failed", "Failed")} value={failed} delta={failed > 0 ? t("production.retryAvailable") : t("common.none")} />
      </div>

      <DashboardCard title={t("dashboard.productionPipeline")} description={t("production.monitorAndManage", "Monitor and manage your production jobs")}>
        <div className="space-y-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">{t("common.loading")}</p>
          )}
          {!isLoading && jobs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">{t("production.empty")}</p>
          )}
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium">{String(job.payload?.data?.name ?? job.type)}</h4>
                  <Badge tone={statusBadgeTone(job.status)}>
                    {mapStatus(job.status)}
                  </Badge>
                  <Badge tone={priorityBadgeTone(job.priority)}>
                    {mapPriority(job.priority)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{job.type}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                  <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {job.status === "processing" && (
                  <Button variant="ghost" size="icon" className="size-8">
                    <Pause className="size-4" />
                  </Button>
                )}
                {job.status === "failed" && (
                  <Button variant="ghost" size="icon" className="size-8">
                    <RotateCcw className="size-4" />
                  </Button>
                )}
                {job.status === "queued" && (
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
  )
}
