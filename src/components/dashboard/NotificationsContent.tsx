"use client";

import * as React from "react";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";

const NOTIFICATIONS = [
  { id: "1", title: "Production job completed", description: "Hero Video Render finished successfully.", time: "2 minutes ago", read: false, type: "success" as const },
  { id: "2", title: "New team member invited", description: "Carol White accepted the invite to Acme Studio.", time: "1 hour ago", read: false, type: "info" as const },
  { id: "3", title: "AI provider rate limit warning", description: "OpenAI usage reached 80% of daily limit.", time: "3 hours ago", read: false, type: "warning" as const },
  { id: "4", title: "Project archived", description: "Instagram Reels Batch was moved to archive.", time: "1 day ago", read: true, type: "info" as const },
  { id: "5", title: "Billing reminder", description: "Your next invoice is scheduled for Nov 1, 2026.", time: "2 days ago", read: true, type: "info" as const },
  { id: "6", title: "Production job failed", description: "Media Processing job encountered an error.", time: "3 days ago", read: true, type: "error" as const },
];

export function NotificationsContent() {
  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const filtered = filter === "unread" ? NOTIFICATIONS.filter(n => !n.read) : NOTIFICATIONS
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length

  const iconMap = {
    success: <CheckCircle2 className="size-5 text-green-500" />,
    info: <Info className="size-5 text-sky-500" />,
    warning: <AlertTriangle className="size-5 text-amber-500" />,
    error: <XCircle className="size-5 text-red-500" />,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread
          {unreadCount > 0 && <span className="ml-2 rounded-full bg-sky-500 px-2 py-0.5 text-xs font-medium text-white">{unreadCount}</span>}
        </Button>
      </div>

      <DashboardCard title={`Notifications (${filtered.length})`} description={filter === "unread" ? "Showing unread notifications only" : "All recent notifications"}>
        <div className="space-y-3">
          {filtered.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                notification.read
                  ? "border-border bg-muted/20"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {iconMap[notification.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{notification.title}</h4>
                  {!notification.read && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="size-8">
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
