"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { useLocalizationContext } from "@/providers/localization"

type AdminInfo = {
  id: string
  email: string
  name: string
  role: string
  initials: string
  isActive: boolean
  lastLoginAt?: string
}

export function AdminAvatarDropdown() {
  const [open, setOpen] = React.useState(false)
  const [logoutDialog, setLogoutDialog] = React.useState(false)
  const [adminInfo, setAdminInfo] = React.useState<AdminInfo | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()
  const { t } = useLocalizationContext()

  React.useEffect(() => {
    let cancelled = false
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" })
        if (!res.ok) {
          if (process.env.NODE_ENV === "development") {
            if (!cancelled) {
              setAdminInfo({
                id: "dev-admin",
                email: "admin@tamer.studio",
                name: "Admin User",
                role: "super_admin",
                initials: "AU",
                isActive: true,
                lastLoginAt: new Date().toISOString(),
              })
              setLoading(false)
            }
            return
          }
          throw new Error("Failed to fetch admin info")
        }
        const data = await res.json()
        if (!cancelled) {
          setAdminInfo(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          if (process.env.NODE_ENV === "development") {
            setAdminInfo({
              id: "dev-admin",
              email: "admin@tamer.studio",
              name: "Admin User",
              role: "super_admin",
              initials: "AU",
              isActive: true,
              lastLoginAt: new Date().toISOString(),
            })
            setLoading(false)
            return
          }
          logger.error("Failed to fetch admin info", err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      }
    }
    fetchAdmin()
    return () => { cancelled = true }
  }, [])

  const displayName = adminInfo?.name || "Admin"
  const displayRole = adminInfo?.role ? (adminInfo.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())) : "Admin"
  const initials = adminInfo?.initials || displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    try {
      setLogoutDialog(false)
      setOpen(false)

      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      toast.success(t("common.signOut", "Signed out successfully"))

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
        aria-label={t("admin.accountMenu", "Account menu")}
      >
        <Avatar name={initials} size={32} />
        {!loading && (
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium leading-none">{displayName}</span>
            <span className="text-xs text-muted-foreground leading-none mt-0.5">
              {displayRole}
            </span>
          </div>
        )}
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
              <Avatar name={initials} size={40} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{displayName}</span>
                <span className="text-xs text-muted-foreground truncate">{adminInfo?.email}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{displayRole}</span>
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
                <span>{t("admin.profile", "Profile")}</span>
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Settings className="size-4" />
                <span>{t("admin.settings", "Settings")}</span>
              </Link>
              <Link
                href="/admin/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <CreditCard className="size-4" />
                <span>{t("admin.billing", "Billing")}</span>
              </Link>
              <Link
                href="/admin/api-keys"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Key className="size-4" />
                <span>{t("admin.apiKeys", "API Keys")}</span>
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
                <span>{t("common.signOut", "Sign out")}</span>
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
                <h3 className="font-semibold">{t("admin.confirm", "Confirm Sign Out")}</h3>
                <p className="text-sm text-muted-foreground">{t("admin.confirmSignOut", "Are you sure you want to sign out?")}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLogoutDialog(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
              <Button variant="destructive" onClick={handleSignOut} className="flex-1">{t("common.signOut", "Sign Out")}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
