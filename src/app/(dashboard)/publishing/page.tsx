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
import { BarChart3, ExternalLink } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"
import { publicationStore, type Publication } from "@/features/publishing/publishing.store"

export default function PublishingPage() {
  const { t } = useLocalizationContext();
  const [publications, setPublications] = React.useState<Publication[]>([]);

  React.useEffect(() => {
    setPublications(publicationStore.getAll());
  }, []);

  const totalPublished = publications.filter((p) => p.status === "Published").length;
  const totalScheduled = publications.filter((p) => p.status === "Scheduled").length;

  return (
    <AppShell>
      <PageLayout title={t("dashboard.publishing")} description={t("dashboard.publishingDesc")} breadcrumb={[{ label: t("dashboard.publishing") }]} actions={<ActionButton onClick={() => console.warn("TODO: open new publication dialog")}>{t("dashboard.newPublication")}</ActionButton>}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("publishing.totalPublications", "Total Publications")} value={publications.length} delta={t("publishing.thisMonth", "+3 this month")} />
            <StatCard title={t("publishing.published", "Published")} value={totalPublished} delta={publications.length > 0 ? `${Math.round((totalPublished / publications.length) * 100)}% ${t("common.success")}` : t("common.none")} />
            <StatCard title={t("publishing.scheduled", "Scheduled")} value={totalScheduled} delta={totalScheduled > 0 ? `${t("common.next")}: ${publications.find((p) => p.status === "Scheduled")?.date ?? ""}` : t("common.none")} />
            <StatCard title={t("publishing.totalViews", "Total Views")} value="45.2K" delta={t("publishing.vsLastMonth", "+12% vs last month")} />
          </div>

          <DashboardCard title={t("dashboard.publishing")} description={t("publishing.manageScheduled", "Manage your scheduled and published content")}>
            {publications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("publishing.empty")}</p>
            ) : (
              <div className="space-y-3">
                {publications.map((pub) => (
                  <div key={pub.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{pub.title}</h4>
                        <Badge tone={
                          pub.status === "Published" ? "success" :
                          pub.status === "Scheduled" ? "info" :
                          pub.status === "Draft" ? "muted" : "default"
                        }>
                          {pub.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pub.platform} • {pub.date} • {pub.views !== "—" ? `${pub.views} ${t("publishing.views")}` : t("publishing.notYetPublished", "Not yet published")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon" className="size-8">
                        <BarChart3 className="size-4" />
                      </Button>
                      <Link href={pub.platform === "YouTube" ? "https://youtube.com" : pub.platform === "TikTok" ? "https://tiktok.com" : "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <ExternalLink className="mr-1 size-4" />
                        {t("common.view")}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </PageLayout>
    </AppShell>
  )
}
