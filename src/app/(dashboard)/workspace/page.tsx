import * as React from "react";
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

export const metadata = { title: "Workspace - Tamer Studio", description: "Manage workspaces, teams, and members." };

export default function WorkspacePage() {
  const { t } = useLocalizationContext();

  return (
    <AppShell>
      <PageLayout title={t("dashboard.workspace")} description={t("dashboard.manageWorkspace")} breadcrumb={[{ label: t("dashboard.workspace") }]} actions={<ActionButton>{t("dashboard.createWorkspace")}</ActionButton>}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title={t("admin.workspaces")} value={3} delta="+1 this month" />
              <StatCard title={t("admin.users")} value={12} delta="+2 new invites" />
              <StatCard title={t("admin.roles")} value={4} delta="Admin, Editor, Viewer" />
              <StatCard title={t("admin.storageLimit")} value="24.5 GB" delta="of 100 GB" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <WorkspaceList />
          </div>

          <div className="lg:col-span-3">
            <DashboardCard title={t("admin.users")} description={t("admin.members")}>
              <div className="space-y-3">
                {[
                  { name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
                  { name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active" },
                  { name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Pending" },
                  { name: "David Lee", email: "david@example.com", role: "Editor", status: "Active" },
                ].map((member) => (
                  <div key={member.email} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
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
            </DashboardCard>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  );
}
