"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { usePermissions } from "@/components/auth/use-permissions"
import { useLocalizationContext } from "@/providers/localization"
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
import { logger } from "@/core/logger"

export function AvatarDropdown() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { role, isAdmin, isSuperAdmin } = usePermissions()
  const { t } = useLocalizationContext()

  const handleSignOut = async () => {
    try {
      setOpen(false)
      
      // Call clean sign-out API
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(t("auth.signOutFailed"))
      }

      toast.success(t("auth.signedOutSuccess"))
      
      // Use replace to prevent back button
      router.replace("/login")
      
      // Refresh page to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 500))
      router.refresh()
      
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err)
      logger.error("Sign-out error", new Error(error))
      toast.error(error || t("auth.signOutFailed"))
    }
  }

  const roleLabels: Record<string, { label: string; icon: typeof Shield }> = {
    workspace_admin: { label: t("roles.workspaceAdmin"), icon: Shield },
    organization_admin: { label: t("roles.orgAdmin"), icon: Shield },
    system_admin: { label: t("roles.systemAdmin"), icon: Shield },
    super_admin: { label: t("roles.superAdmin"), icon: Crown },
  }

  const RoleBadge = roleLabels[role]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("dropdown.accountMenu")}
      >
        <Avatar name={isSuperAdmin ? "S" : isAdmin ? "A" : "U"} size={32} />
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">{t("dropdown.account")}</span>
          <span className="text-xs text-muted-foreground leading-none mt-0.5">
            {isSuperAdmin ? t("roles.superAdmin") : isAdmin ? t("roles.admin") : t("roles.user")}
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
                <span className="text-sm font-medium">{t("dropdown.account")}</span>
                <span className="text-xs text-muted-foreground">{t("dropdown.placeholderEmail")}</span>
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
                <span>{t("nav.profile")}</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Settings className="size-4" />
                <span>{t("nav.settings")}</span>
              </Link>
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <CreditCard className="size-4" />
                <span>{t("nav.billing")}</span>
              </Link>
              <Link
                href="/api-keys"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                role="menuitem"
              >
                <Key className="size-4" />
                <span>{t("nav.apiKeys")}</span>
              </Link>
            </div>

            <div className="my-1 h-px bg-border/60" />

            <div className="py-1">
              <button
                onClick={() => {
                  handleSignOut()
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                role="menuitem"
              >
                <LogOut className="size-4" />
                <span>{t("common.signOut")}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
