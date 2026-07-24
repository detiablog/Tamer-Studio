"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, User, Mail, Shield, Building, Globe, Key } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

export default function ProfilePage() {
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "Admin User", email: "admin@tamer.studio", role: "Super Admin", organization: "Tamer Studio" });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success("Profile updated"); }, 600);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your admin profile</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold">A</div>
          <div>
            <h3 className="font-semibold">Admin User</h3>
            <p className="text-sm text-muted-foreground">admin@tamer.studio</p>
            <Badge tone="info" className="mt-1">Super Admin</Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" /></div>
          <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1" /></div>
          <div><Label>Role</Label><Input value={formData.role} readOnly className="mt-1 bg-muted/50" /></div>
          <div><Label>Organization</Label><Input value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="mt-1" /></div>
        </div>

        <div className="flex gap-2 pt-6 border-t border-border mt-6">
          <Button onClick={handleSave} disabled={saving}><Save className="mr-2 size-4" />{saving ? "Saving..." : "Save Changes"}</Button>
          <Button variant="outline" onClick={() => { if (confirm("Reset profile to default settings?")) { setFormData({ name: "Admin User", email: "admin@tamer.studio", role: "Super Admin", organization: "Tamer Studio" }); toast.success("Profile reset to defaults"); } }}><RefreshCw className="mr-2 size-4" />Reset</Button>
        </div>
      </DashboardCard>
    </div>
  );
}