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

export const metadata = { title: "Production - Tamer Studio", description: "Manage production pipelines, queues and job history." }

const JOBS = [
  { id: "1", name: "Hero Video Render", workflow: "Video Generation", status: "Running", progress: 72, priority: "High", owner: "You", project: "Q4 Campaign" },
  { id: "2", name: "Product Image Batch", workflow: "Image Generation", status: "Queued", progress: 0, priority: "Medium", owner: "You", project: "Product Launch" },
  { id: "3", name: "Voiceover Generation", workflow: "Audio Generation", status: "Running", progress: 45, priority: "Low", owner: "You", project: "Podcast Ep" },
  { id: "4", name: "Script Finalization", workflow: "Script Generation", status: "Completed", progress: 100, priority: "Medium", owner: "You", project: "Q4 Campaign" },
  { id: "5", name: "Media Processing", workflow: "Media Processing", status: "Failed", progress: 30, priority: "High", owner: "You", project: "Social Batch" },
]

export default function ProductionPage() {
  return (
    <AppShell>
      <PageLayout title={"Production"} description={"Production pipeline and queues."} breadcrumb={[{ label: "Production" }]} actions={<ActionButton>New Job</ActionButton>}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Jobs" value={24} delta="+3 today" />
            <StatCard title="Running" value={3} delta="2 queued" />
            <StatCard title="Completed" value={18} delta="75% success rate" />
            <StatCard title="Failed" value={2} delta="Retry available" />
          </div>

          <DashboardCard title="Production Queue" description="Monitor and manage your production jobs">
            <div className="space-y-3">
              {JOBS.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{job.name}</h4>
                      <Badge tone={
                        job.status === "Running" ? "info" :
                        job.status === "Completed" ? "success" :
                        job.status === "Failed" ? "warning" :
                        job.status === "Queued" ? "muted" : "default"
                      }>
                        {job.status}
                      </Badge>
                      <Badge tone={job.priority === "High" ? "warning" : job.priority === "Medium" ? "info" : "muted"}>
                        {job.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{job.workflow} • {job.project}</p>
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
                    <Link href={`/production/${job.id}`} className="text-sm text-primary hover:underline">Details</Link>
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
