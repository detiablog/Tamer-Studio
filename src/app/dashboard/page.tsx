import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  Rocket,
  FolderOpen,
  ImageIcon,
  Cpu,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const metadata = { title: "Dashboard - Tamer Studio", description: "Overview of your workspace, projects, recent media, and activity." };

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Projects" value={12} delta={<span className="text-xs text-muted-foreground">+2 this week</span>} />
        <StatCard title="Media Assets" value={48} delta={<span className="text-xs text-muted-foreground">+8 new files</span>} />
        <StatCard title="Running Jobs" value={3} delta={<span className="text-xs text-muted-foreground">2 queued</span>} />
        <StatCard title="AI Generations" value={156} delta={<span className="text-xs text-muted-foreground">+24 today</span>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCard title="Recent Projects" description="Your latest production projects">
            <div className="space-y-3">
              {[
                { name: "Q4 Affiliate Campaign", status: "In Production", updated: "2 hours ago", progress: 65 },
                { name: "YouTube Shorts Series", status: "Draft", updated: "1 day ago", progress: 20 },
                { name: "TikTok Product Launch", status: "Completed", updated: "3 days ago", progress: 100 },
                { name: "Instagram Reels Batch", status: "In Review", updated: "5 hours ago", progress: 85 },
              ].map((project) => (
                <div key={project.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge tone={project.status === "Completed" ? "success" : project.status === "In Production" ? "info" : project.status === "In Review" ? "warning" : "muted"}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Updated {project.updated}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">Open</Link>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/projects" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">View all projects</Link>
            </div>
          </DashboardCard>

          <DashboardCard title="Production Queue" description="Active and upcoming production jobs">
            <div className="space-y-3">
              {[
                { name: "Hero Video Render", status: "Running", progress: 72, owner: "You" },
                { name: "Product Image Batch", status: "Queued", progress: 0, owner: "You" },
                { name: "Voiceover Generation", status: "Running", progress: 45, owner: "You" },
              ].map((job) => (
                <div key={job.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{job.name}</h4>
                      <Badge tone={job.status === "Running" ? "info" : job.status === "Queued" ? "muted" : "success"}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Owner: {job.owner}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
                    </div>
                  </div>
                  <Link href="/production" className="text-sm text-primary hover:underline">Details</Link>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/production" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">View all jobs</Link>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-6">
          <DashboardCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New Project", icon: FolderOpen, href: "/projects" },
                { label: "Generate Media", icon: ImageIcon, href: "/media" },
                { label: "Start Production", icon: Rocket, href: "/production" },
                { label: "Open AI Studio", icon: Cpu, href: "/ai" },
              ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href as Parameters<typeof Link>[0]["href"]}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/20 p-4 text-center transition hover:border-foreground/10"
                  >
                  <action.icon className="size-5 text-muted-foreground" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Recent Activity">
            <div className="space-y-3">
              {[
                { text: "Project 'Q4 Campaign' was updated", time: "2 hours ago", icon: Clock },
                { text: "Image generation completed", time: "4 hours ago", icon: CheckCircle2 },
                { text: "New team member joined", time: "1 day ago", icon: TrendingUp },
                { text: "Production job failed", time: "2 days ago", icon: AlertCircle },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-muted/40 p-1.5">
                    <activity.icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="AI Usage">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This month</span>
                <span className="font-medium">1,248 generations</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credits remaining</span>
                <span className="font-medium">8,432</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Top provider</span>
                <span className="font-medium">OpenAI</span>
              </div>
              <Link href="/ai" className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">View AI Platform</Link>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
