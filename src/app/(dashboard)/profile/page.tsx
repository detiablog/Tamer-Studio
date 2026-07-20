import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/Avatar"
import { Mail, MapPin, Briefcase, Shield, Key, Bell, Globe } from "lucide-react"

export const metadata = { title: "Profile - Tamer Studio", description: "Manage your profile and preferences." }

const PROFILE = {
  name: "Alex Creator",
  email: "alex@example.com",
  role: "Admin",
  workspace: "Acme Studio",
  location: "Bangkok, Thailand",
  plan: "Pro",
  joined: "March 2026",
  avatar: "AC",
}

export default function ProfilePage() {
  return (
    <AppShell>
      <PageLayout
        title={"Profile"}
        description={"Your account information and preferences."}
        breadcrumb={[{ label: "Profile" }]}
        actions={
          <Button>Save Changes</Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DashboardCard title="Profile">
              <div className="flex flex-col items-center text-center">
                <Avatar name={PROFILE.avatar} size={80} />
                <h3 className="mt-4 text-lg font-semibold">{PROFILE.name}</h3>
                <p className="text-sm text-muted-foreground">{PROFILE.email}</p>
                <div className="mt-3 flex gap-2">
                  <Badge tone="info">{PROFILE.role}</Badge>
                  <Badge tone="success">{PROFILE.plan}</Badge>
                </div>
                <div className="mt-4 w-full space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="size-4" />
                    <span>{PROFILE.workspace}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{PROFILE.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="size-4" />
                    <span>Joined {PROFILE.joined}</span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <DashboardCard title="Account Settings" description="Update your account information">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input type="text" defaultValue="Alex" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input type="text" defaultValue="Creator" className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <input type="email" defaultValue={PROFILE.email} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea rows={3} defaultValue="AI content creator and video producer." className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Preferences" description="Customize your experience">
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", description: "Receive email updates about your account activity", icon: Bell },
                  { label: "Two-Factor Authentication", description: "Add an extra layer of security to your account", icon: Shield },
                  { label: "Public Profile", description: "Make your profile visible to other team members", icon: Globe },
                  { label: "API Access", description: "Generate API keys for programmatic access", icon: Key },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                      <pref.icon className="size-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{pref.label}</h4>
                        <p className="text-xs text-muted-foreground">{pref.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  )
}
