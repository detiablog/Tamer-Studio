import * as React from "react";
import { cookies } from "next/headers";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ProjectList } from "@/features/project/ProjectList";
import { Clock, TrendingUp, Archive } from "lucide-react";
import { ProjectsActions } from "./Actions";
import { generatePageMetadata } from "@/core/seo";
import { getTranslation } from "@/lib/localization/translations";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);
  return generatePageMetadata({
    route: "/projects",
    title: t("projects.metadataTitle", "Projects — Tamer Studio"),
    description: t("projects.metadataDescription", "Create and manage production projects, assets, and schedules."),
    keywords: ["Tamer Studio projects", "production projects", "content management"],
    type: "website",
  });
}

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  return (
    <AppShell>
      <PageLayout 
        title={t("projects.pageTitle", "Projects")} 
        description={t("projects.description", "Organize and manage your production projects.")} 
        breadcrumb={[{ label: t("projects.pageTitle", "Projects") }]} 
        actions={<ProjectsActions />}
      >
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("projects.totalProjects", "Total Projects")} value={12} delta={t("projects.plus2ThisMonth", "+2 this month")} />
            <StatCard title={t("projects.inProduction", "In Production")} value={5} delta={t("projects.activeNow", "Active now")} />
            <StatCard title={t("projects.archived", "Archived")} value={8} delta={t("projects.last30Days", "Last 30 days")} />
            <StatCard title={t("projects.avgCompletion", "Avg. Completion")} value="82%" delta={t("projects.plus5VsLastMonth", "+5% vs last month")} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCard title={t("projects.allProjects", "All Projects")} description={t("projects.allProjectsDesc", "Manage and organize your projects")}>
                <ProjectList />
              </DashboardCard>
            </div>
            <div className="space-y-6">
              <DashboardCard title={t("projects.recentActivity", "Recent Activity")}>
                <div className="space-y-3">
                  {[
                    { text: t("projects.activityQ4CampaignUpdated", "Q4 Campaign updated"), time: t("projects.activity2HoursAgo", "2 hours ago"), icon: Clock },
                    { text: t("projects.activityNewProjectCreated", "New project created"), time: t("projects.activity1DayAgo", "1 day ago"), icon: TrendingUp },
                    { text: t("projects.activityProjectArchived", "Project archived"), time: t("projects.activity3DaysAgo", "3 days ago"), icon: Archive },
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

              <DashboardCard title={t("projects.popularTags", "Popular Tags")}>
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
