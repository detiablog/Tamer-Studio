"use client"

import * as React from "react"
import { Bell, CheckCheck, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Notification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
}

let NOTIFICATIONS: Notification[] = [
  { id: "1", title: "Production job completed", description: "Hero Video Render finished successfully.", time: "2 minutes ago", read: false, type: "success" },
  { id: "2", title: "New team member invited", description: "Carol White accepted the invite.", time: "1 hour ago", read: false, type: "info" },
  { id: "3", title: "AI provider rate limit warning", description: "OpenAI usage reached 80% of daily limit.", time: "3 hours ago", read: false, type: "warning" },
  { id: "4", title: "Project archived", description: "Instagram Reels Batch was moved to archive.", time: "1 day ago", read: true, type: "info" },
  { id: "5", title: "Billing reminder", description: "Your next invoice is scheduled for Nov 1.", time: "2 days ago", read: true, type: "info" },
]

const typeConfig = {
  info: { icon: Bell, color: "text-sky-500", bg: "bg-sky-500/10" },
  success: { icon: CheckCheck, color: "text-green-500", bg: "bg-green-500/10" },
  warning: { icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
  error: { icon: Bell, color: "text-red-500", bg: "bg-red-500/10" },
}

export function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const handleViewAll = () => {
    onClose()
    toast.info("Opening notification center — TODO: Navigate to full notification page")
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
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
          <span className="text-sm font-medium">Notifications</span>
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
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No notifications</div>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.type]
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
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{notification.time}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mx-3 my-1 h-px bg-border/60" />

      <div className="px-1.5 py-1 flex gap-1">
        <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleViewAll}>
          View all notifications
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>
    </div>
  )
}
