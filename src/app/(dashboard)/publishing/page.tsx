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

export const metadata = { title: "Publishing - Tamer Studio", description: "Schedule and publish content to external platforms." }

const PUBLICATIONS = [
  { id: "1", title: "Q4 Campaign Launch", platform: "YouTube", status: "Scheduled", date: "Oct 25, 2026", views: "—" },
  { id: "2", title: "Product Review Short", platform: "TikTok", status: "Published", date: "Oct 20, 2026", views: "12.4K" },
  { id: "3", title: "Affiliate Link Roundup", platform: "Instagram", status: "Published", date: "Oct 18, 2026", views: "3.2K" },
  { id: "4", title: "Tutorial Series Ep.1", platform: "YouTube", status: "Draft", date: "Nov 1, 2026", views: "—" },
]

export default function PublishingPage() {
  return (
    <AppShell>
      <PageLayout title={"Publishing"} description={"Schedule and publish content to external platforms."} breadcrumb={[{ label: "Publishing" }]} actions={<ActionButton>New Publication</ActionButton>}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Publications" value={24} delta="+3 this month" />
            <StatCard title="Published" value={18} delta="75% success" />
            <StatCard title="Scheduled" value={4} delta="Next: Oct 25" />
            <StatCard title="Total Views" value="45.2K" delta="+12% vs last month" />
          </div>

          <DashboardCard title="Publications" description="Manage your scheduled and published content">
            <div className="space-y-3">
              {PUBLICATIONS.map((pub) => (
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
                      {pub.platform} • {pub.date} • {pub.views !== "—" ? `${pub.views} views` : "Not yet published"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" className="size-8">
                      <BarChart3 className="size-4" />
                    </Button>
                    <Link href={pub.platform === "YouTube" ? "https://youtube.com" : pub.platform === "TikTok" ? "https://tiktok.com" : "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                      <ExternalLink className="mr-1 size-4" />
                      View
                    </Link>
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
