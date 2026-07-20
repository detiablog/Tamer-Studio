import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { ProjectList } from "@/features/project/ProjectList";
import { Clock, TrendingUp, Archive } from "lucide-react";

export const metadata = { title: "Projects - Tamer Studio", description: "Create and manage production projects, assets, and schedules." };

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageLayout title={"Projects"} description={"Organize and manage your production projects."} breadcrumb={[{ label: "Projects" }]} actions={<ActionButton>New Project</ActionButton>}>
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Projects" value={12} delta="+2 this month" />
            <StatCard title="In Production" value={5} delta="Active now" />
            <StatCard title="Archived" value={8} delta="Last 30 days" />
            <StatCard title="Avg. Completion" value="82%" delta="+5% vs last month" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCard title="All Projects" description="Manage and organize your projects">
                <ProjectList />
              </DashboardCard>
            </div>
            <div className="space-y-6">
              <DashboardCard title="Recent Activity">
                <div className="space-y-3">
                  {[
                    { text: "Q4 Campaign updated", time: "2 hours ago", icon: Clock },
                    { text: "New project created", time: "1 day ago", icon: TrendingUp },
                    { text: "Project archived", time: "3 days ago", icon: Archive },
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

              <DashboardCard title="Popular Tags">
              <div className="flex flex-wrap gap-2">
                {["affiliate", "video", "social", "product", "tutorial", "review", "promo", "launch"].map((tag) => (
                  <span key={tag} className="cursor-pointer rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted">#{tag}</span>
                ))}
              </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  );
}
