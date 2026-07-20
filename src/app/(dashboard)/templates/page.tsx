import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { FileText, Star, Copy, Search } from "lucide-react"

export const metadata = { title: "Templates - Tamer Studio", description: "Manage prompt and production templates." }

const TEMPLATES = [
  { id: "1", name: "YouTube Script Template", category: "Script", uses: 24, favorite: true },
  { id: "2", name: "Product Image Prompt", category: "Prompt", uses: 18, favorite: false },
  { id: "3", name: "Social Media Batch", category: "Production", uses: 12, favorite: true },
  { id: "4", name: "Voiceover Style Guide", category: "Prompt", uses: 8, favorite: false },
  { id: "5", name: "Affiliate Review Framework", category: "Script", uses: 15, favorite: true },
]

export default function TemplatesPage() {
  return (
    <AppShell>
      <PageLayout
        title={"Templates"}
        description={"Reusable prompt and production templates."}
        breadcrumb={[{ label: "Templates" }]}
        actions={<ActionButton>Create Template</ActionButton>}
      >
        <div className="space-y-6">
          <DashboardCard title="Templates" description="Quick-start templates for common workflows">
            <div className="flex items-center gap-2 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <Button variant="outline" size="sm">Filter</Button>
            </div>

            <div className="space-y-3">
              {TEMPLATES.map((template) => (
                <div key={template.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.favorite && <Star className="size-4 text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge tone="muted">{template.category}</Badge>
                        <span className="text-xs text-muted-foreground">{template.uses} uses</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8">
                      <Copy className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm">Use</Button>
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
