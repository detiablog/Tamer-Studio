"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR("/api/admin/stats", fetcher);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive p-8">Failed to load admin stats</div>;
  }

  const metrics = data?.metrics || {};
  const jobs = data?.jobs || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={metrics.totalUsers ?? 0} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +12% this week</span>} />
        <StatCard title="Active Workspaces" value={metrics.activeWorkspaces ?? 0} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +5 this week</span>} />
        <StatCard title="Active Jobs" value={jobs.processing ?? 0} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowDownRight className="size-3" /> -3 from yesterday</span>} />
        <StatCard title="Revenue" value={metrics.revenue ?? "$0"} delta={<span className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3" /> +8.2% vs last month</span>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Revenue Overview" description="Platform revenue for the last 7 days">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Today", value: metrics.revenueToday ?? "$0", change: "+5.2%" },
              { label: "This Week", value: metrics.revenueWeek ?? "$0", change: "+12.1%" },
              { label: "This Month", value: metrics.revenueMonth ?? "$0", change: "+8.2%" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="size-3" />
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Production Jobs" description="Recent jobs across all workspaces">
          <div className="space-y-3">
            {[
              { name: "Hero Video Render", status: "Running", progress: 72, owner: "Alice Johnson" },
              { name: "Product Image Batch", status: "Queued", progress: 0, owner: "Bob Smith" },
              { name: "Voiceover Generation", status: "Running", progress: 45, owner: "Carol White" },
            ].map((job) => (
              <div key={job.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{job.name}</h4>
                    <Badge tone={job.status === "Running" ? "info" : job.status === "Completed" ? "success" : job.status === "Queued" ? "muted" : "default"}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Owner: {job.owner}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
                <Link href="/admin/jobs" className="text-sm text-primary hover:underline">Details</Link>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/admin/jobs" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">View all jobs</Link>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}