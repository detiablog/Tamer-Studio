import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Download, Receipt } from "lucide-react"

export const metadata = { title: "Billing - Tamer Studio", description: "Manage billing, invoices, and payment methods." }

const INVOICES = [
  { id: "1", date: "Oct 1, 2026", amount: "$49.00", status: "Paid", plan: "Pro" },
  { id: "2", date: "Sep 1, 2026", amount: "$49.00", status: "Paid", plan: "Pro" },
  { id: "3", date: "Aug 1, 2026", amount: "$29.00", status: "Paid", plan: "Starter" },
  { id: "4", date: "Nov 1, 2026", amount: "$49.00", status: "Upcoming", plan: "Pro" },
]

export default function BillingPage() {
  return (
    <AppShell>
      <PageLayout
        title={"Billing"}
        description={"Invoices, payment methods, and billing history."}
        breadcrumb={[{ label: "Billing" }]}
        actions={<ActionButton>Upgrade Plan</ActionButton>}
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Current Plan" value="Pro" delta="$49/month" />
            <StatCard title="Next Invoice" value="$49.00" delta="Due Nov 1, 2026" />
            <StatCard title="Payment Method" value="•••• 4242" delta="Expires 12/27" />
            <StatCard title="Credits Remaining" value="8,432" delta="$120.50 value" />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardCard title="Billing History" description="Your recent invoices and payments">
                <div className="space-y-3">
                  {INVOICES.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                          <Receipt className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium">{invoice.plan} Plan</h4>
                          <p className="text-xs text-muted-foreground">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{invoice.amount}</p>
                          <Badge tone={invoice.status === "Paid" ? "success" : invoice.status === "Upcoming" ? "info" : "muted"}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>

            <div className="space-y-6">
              <DashboardCard title="Payment Method">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                    <CreditCard className="size-8 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Visa ending in 4242</h4>
                      <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                    </div>
                      <Badge tone="success">Default</Badge>
                  </div>
                  <Button variant="outline" className="w-full">Add Payment Method</Button>
                </div>
              </DashboardCard>

              <DashboardCard title="Usage This Month">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">AI Generations</span>
                      <span className="font-medium">1,248 / 5,000</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-2 rounded-full bg-primary" style={{ width: "25%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium">24.5 GB / 100 GB</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-2 rounded-full bg-primary" style={{ width: "24.5%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">API Calls</span>
                      <span className="font-medium">3,420 / 10,000</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-2 rounded-full bg-primary" style={{ width: "34%" }} />
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  )
}
