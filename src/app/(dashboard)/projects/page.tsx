"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ProjectList } from "@/features/project/ProjectList";
import { ProjectsActions } from "./Actions";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProjectsPage() {
  const { t } = useLocalizationContext();
  const { data, isLoading } = useSWR("/api/workspaces", fetcher, { revalidateOnFocus: true });

  const workspaces = data?.data ?? [];
  const totalProjects = workspaces.length;
  const inProduction = workspaces.filter((w: any) => w.status === "active").length;
  const archived = workspaces.filter((w: any) => w.status === "archived").length;
  const avgCompletion = totalProjects > 0
    ? `${Math.round(workspaces.reduce((sum: number, w: any) => sum + (w.completionRate ?? 0), 0) / totalProjects)}%`
    : "0%";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("projects.pageTitle", "Projects")}</h2>
          <p className="text-sm text-muted-foreground">{t("projects.description", "Organize and manage your production projects.")}</p>
        </div>
        <ProjectsActions />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("projects.totalProjects", "Total Projects")} value={isLoading ? "—" : totalProjects} delta={t("projects.thisWorkspace", "This workspace")} />
        <StatCard title={t("projects.inProduction", "In Production")} value={isLoading ? "—" : inProduction} delta={t("projects.activeNow", "Active now")} />
        <StatCard title={t("projects.archived", "Archived")} value={isLoading ? "—" : archived} delta={t("projects.last30Days", "Last 30 days")} />
        <StatCard title={t("projects.avgCompletion", "Avg. Completion")} value={isLoading ? "—" : avgCompletion} delta={t("projects.overall", "Overall")} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCard title={t("projects.allProjects", "All Projects")} description={t("projects.allProjectsDesc", "Manage and organize your projects")}>
            <ProjectList />
          </DashboardCard>
        </div>
        <div className="space-y-6">
          <DashboardCard title={t("projects.popularTags", "Popular Tags")}>
            <div className="flex flex-wrap gap-2">
              {workspaces.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("projects.noTagsYet", "No tags yet")}</p>
              ) : (
                ["affiliate", "video", "social", "product", "tutorial", "review", "promo", "launch"].map((tag) => (
                  <span key={tag} className="cursor-pointer rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted">#{tag}</span>
                ))
              )}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
