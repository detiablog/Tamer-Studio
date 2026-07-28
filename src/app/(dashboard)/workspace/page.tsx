"use client";

import * as React from "react";
import useSWR from "swr";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { WorkspaceList } from "@/features/workspace/WorkspaceList";
import { MoreVertical } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface WorkspaceMember {
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function WorkspacePage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading } = useSWR("/api/workspaces", fetcher);

  const workspaces = data?.data ?? [];
  const members: WorkspaceMember[] = React.useMemo(() => {
    const result: WorkspaceMember[] = [];
    for (const ws of workspaces) {
      if (Array.isArray(ws.members)) {
        for (const m of ws.members) {
          if (!result.find((r) => r.email === m.email)) {
            result.push({
              name: m.name,
              email: m.email ?? "",
              role: m.role ?? t("roles.viewer"),
              status: t("admin.active"),
            });
          }
        }
      }
    }
    return result;
  }, [workspaces]);

  return (
    <AppShell>
      <PageLayout title={t("dashboard.workspace")} description={t("dashboard.manageWorkspace")} breadcrumb={[{ label: t("dashboard.workspace") }]} actions={<ActionButton>{t("dashboard.createWorkspace")}</ActionButton>}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title={t("admin.workspaces")} value={workspaces.length} delta={t("dashboard.delta.thisMonth", "+1 this month")} />
              <StatCard title={t("admin.users")} value={members.length} delta={t("dashboard.delta.newInvites", "+2 new invites")} />
              <StatCard title={t("admin.roles")} value={4} delta={t("dashboard.delta.roles", "Admin, Editor, Viewer")} />
              <StatCard title={t("admin.storageLimit")} value="24.5 GB" delta={t("dashboard.delta.storage", "of 100 GB")} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <WorkspaceList />
          </div>

          <div className="lg:col-span-3">
            <DashboardCard title={t("admin.users")} description={t("admin.members")}>
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                  {t("common.loading")}
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8 text-sm text-destructive">
                  {t("common.failedToLoad", "Failed to load data")}
                </div>
              ) : (
                <div className="space-y-3">
                  {members.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">{t("workspace.noMembers")}</p>
                  )}
                  {members.map((member) => (
                    <div key={member.email || member.name} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={member.role === "Admin" ? "info" : "muted"}>{member.role}</Badge>
                        <Badge tone={member.status === "Active" ? "success" : "warning"}>{member.status}</Badge>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  );
}
