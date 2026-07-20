"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/features/auth/services/auth.service"
import { toast } from "sonner"
import { usePermissions } from "@/components/auth/use-permissions"
import {
  User,
  Settings,
  CreditCard,
  Key,
  LogOut,
  ChevronRight,
  Shield,
  Crown,
} from "lucide-react"

export function AvatarDropdown() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { role, isAdmin, isSuperAdmin } = usePermissions()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      toast.success("Signed out")
      router.push("/login")
    } catch (err: unknown) {
      console.error(err)
      toast.error(String(err ?? "Failed to sign out"))
    }
  }

  const roleLabels: Record<string, { label: string; icon: typeof Shield }> = {
    workspace_admin: { label: "Workspace Admin", icon: Shield },
    organization_admin: { label: "Org Admin", icon: Shield },
    system_admin: { label: "System Admin", icon: Shield },
    super_admin: { label: "Super Admin", icon: Crown },
  }

  const RoleBadge = roleLabels[role]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <Avatar name={isSuperAdmin ? "S" : isAdmin ? "A" : "U"} size={32} />
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">Account</span>
          <span className="text-xs text-muted-foreground leading-none mt-0.5">
            {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "User"}
          </span>
        </div>
        <ChevronRight className="size-3.5 text-muted-foreground rotate-180 hidden md:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 z-50 w-64 rounded-xl bg-card p-1.5 shadow-lg ring-1 ring-foreground/10 animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User info header */}
            <div className="flex items-center gap-3 rounded-lg p-3">
              <Avatar name={isSuperAdmin ? "S" : isAdmin ? "A" : "U"} size={40} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Account</span>
                <span className="text-xs text-muted-foreground">user@example.com</span>
                {RoleBadge && (
                  <span className="flex items-center gap-1 text-[10px] text-primary mt-0.5">
                    <RoleBadge.icon className="size-3" />
                    {RoleBadge.label}
                  </span>
                )}
              </div>
            </div>

            <div className="my-1 h-px bg-border/60" />

            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <User className="size-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <CreditCard className="size-4" />
                <span>Billing</span>
              </Link>
              <Link
                href="/api-keys"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Key className="size-4" />
                <span>API Keys</span>
              </Link>
            </div>

            <div className="my-1 h-px bg-border/60" />

            <div className="py-1">
              <button
                onClick={() => {
                  setOpen(false)
                  handleSignOut()
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                role="menuitem"
              >
                <LogOut className="size-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
