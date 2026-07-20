import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { ImageIcon, Film, Music, FileText, Search, Filter } from "lucide-react"

export const metadata = { title: "Media Library - Tamer Studio", description: "Manage images, video, audio, and generated assets." }

const MEDIA_ITEMS = [
  { id: "1", name: "hero-banner-v2.png", type: "image", size: "2.4 MB", date: "2 hours ago" },
  { id: "2", name: "product-demo.mp4", type: "video", size: "48.2 MB", date: "5 hours ago" },
  { id: "3", name: "voiceover-final.mp3", type: "audio", size: "8.1 MB", date: "1 day ago" },
  { id: "4", name: "script-draft-v3.docx", type: "document", size: "124 KB", date: "2 days ago" },
  { id: "5", name: "thumbnail-01.png", type: "image", size: "1.8 MB", date: "3 days ago" },
  { id: "6", name: "b-roll-city.mp4", type: "video", size: "120 MB", date: "4 days ago" },
]

export default function MediaPage() {
  return (
    <AppShell>
      <PageLayout title={"Media Library"} description={"Store and manage images, audio and video."} breadcrumb={[{ label: "Media" }]} actions={<ActionButton>Upload Media</ActionButton>}>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Assets" value={48} delta="+6 this week" />
            <StatCard title="Images" value={24} delta="12 MB avg" />
            <StatCard title="Videos" value={12} delta="45 MB avg" />
            <StatCard title="Audio" value={12} delta="8 MB avg" />
          </div>

          <DashboardCard title="Media Library" description="Browse and manage your media assets">
            <div className="flex items-center gap-2 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search media..."
                  aria-label="Search media"
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                Filter
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MEDIA_ITEMS.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/40">
                      {item.type === "image" && <ImageIcon className="size-6 text-muted-foreground" />}
                      {item.type === "video" && <Film className="size-6 text-muted-foreground" />}
                      {item.type === "audio" && <Music className="size-6 text-muted-foreground" />}
                      {item.type === "document" && <FileText className="size-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.size} • {item.date}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone={item.type === "image" ? "info" : item.type === "video" ? "warning" : item.type === "audio" ? "success" : "muted"}>
                      {item.type}
                    </Badge>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Showing {MEDIA_ITEMS.length} of 48 assets</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled>Previous</Button>
                <Button variant="ghost" size="sm">Next</Button>
              </div>
            </div>
          </DashboardCard>
        </div>
      </PageLayout>
    </AppShell>
  )
}
