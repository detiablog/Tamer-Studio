"use client"

import * as React from "react"
import { Bell, CheckCheck, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useLocalizationContext } from "@/providers/localization"

type Notification = {
  id: string
  title: string
  message: string
  category: string
  status: string
  priority: string
  createdAt: string
  read: boolean
}

const typeConfig = {
  info: { icon: Bell, color: "text-sky-500", bg: "bg-sky-500/10" },
  success: { icon: CheckCheck, color: "text-green-500", bg: "bg-green-500/10" },
  warning: { icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
  error: { icon: Bell, color: "text-red-500", bg: "bg-red-500/10" },
}

export function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocalizationContext()
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = React.useCallback(async () => {
    if (!open) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/notifications?limit=20", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch notifications")
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notifications"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [open])

  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.read)
      await Promise.all(
        unread.map((n) =>
          fetch(`/api/admin/notifications?id=${n.id}&action=read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "read", id: n.id }),
          }).then((r) => r.ok)
        )
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success(t("admin.notifications.markedAllRead", "All notifications marked as read"))
    } catch {
      toast.error(t("admin.notifications.markAllReadFailed", "Failed to mark all as read"))
    }
  }

  const handleViewAll = () => {
    onClose()
    toast.info(t("admin.notifications.viewAll", "Opening notification center — TODO: Navigate to full notification page"))
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications?id=${id}&action=read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", id }),
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {
      // silent fail for individual mark as read
    }
  }

  if (!open) return null

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-card p-1.5 shadow-lg ring-1 ring-foreground/10 animate-in fade-in slide-in-from-top-2 duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("admin.notifications.title", "Notifications")}</span>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" aria-label="Mark all as read" onClick={markAllRead}>
            <CheckCheck className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Notification settings">
            <Settings className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" aria-label="Close notifications" onClick={onClose}>
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mx-3 my-1 h-px bg-border/60" />

      <div className="max-h-80 overflow-y-auto px-1.5 py-1">
        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">{t("admin.notifications.loading", "Loading notifications...")}</div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-destructive">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">{t("admin.notifications.empty", "No notifications")}</div>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.category as keyof typeof typeConfig] || typeConfig.info
            const Icon = config.icon
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 rounded-lg p-3 transition-colors cursor-pointer",
                  notification.read ? "bg-transparent hover:bg-muted/20" : "bg-muted/20 hover:bg-muted/30"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.bg)}>
                  <Icon className={cn("size-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm leading-tight", !notification.read && "font-medium")}>
                      {notification.title}
                    </p>
                    {!notification.read && <div className="size-2 shrink-0 rounded-full bg-primary mt-1" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mx-3 my-1 h-px bg-border/60" />

      <div className="px-1.5 py-1 flex gap-1">
        <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleViewAll}>
          {t("admin.notifications.viewAll", "View all notifications")}
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
          {t("admin.notifications.markAllRead", "Mark all read")}
        </Button>
      </div>
    </div>
  )
}
