"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  User,
  Settings,
  CreditCard,
  Key,
  LogOut,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { logger } from "@/core/logger"

export function AdminAvatarDropdown() {
  const [open, setOpen] = React.useState(false)
  const [logoutDialog, setLogoutDialog] = React.useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setLogoutDialog(false)
      setOpen(false)

      localStorage.removeItem("admin_session_token");
      console.log("[AdminAvatarDropdown] Cleared localStorage");

      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      }

      console.log("[AdminAvatarDropdown] Logged out successfully")
      toast.success("Signed out successfully")

      router.replace("/admin/login")

      await new Promise(resolve => setTimeout(resolve, 500))
      router.refresh()

    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err)
      logger.error("Admin sign-out error", new Error(error))
      toast.error(error || "Failed to sign out")
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <Avatar name="A" size={32} />
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">Account</span>
          <span className="text-xs text-muted-foreground leading-none mt-0.5">
            Admin
          </span>
        </div>
        <ChevronRight className="size-3.5 text-muted-foreground rotate-180 hidden md:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 z-50 w-72 rounded-xl bg-card p-1.5 shadow-lg ring-1 ring-foreground/10 animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="flex items-center gap-3 rounded-lg p-3">
              <Avatar name="A" size={40} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin Account</span>
                <span className="text-xs text-muted-foreground">admin@tamer.studio</span>
              </div>
            </div>

            <div className="my-1 h-px bg-border/60" />

            <div className="py-1">
              <Link
                href="/admin/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <User className="size-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
              <Link
                href="/admin/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <CreditCard className="size-4" />
                <span>Billing</span>
              </Link>
              <Link
                href="/admin/api-keys"
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
                onClick={() => { setOpen(false); setLogoutDialog(true); }}
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

      {logoutDialog && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setLogoutDialog(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <AlertTriangle className="size-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Confirm Sign Out</h3>
                <p className="text-sm text-muted-foreground">Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLogoutDialog(false)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={handleSignOut} className="flex-1">Sign Out</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
