"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NotificationsContent() {
  const { data, error, mutate } = useSWR("/api/notifications", fetcher);
  const [filter, setFilter] = React.useState<"all" | "unread">("all");

  const notifications = data?.notifications ?? [];
  const filtered = filter === "unread" ? notifications.filter((n: any) => !n.read) : notifications;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const updateNotification = async (id: string, action: "read" | "archive" | "delete") => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    mutate();
  };

  if (error) {
    return <div className="text-destructive">Failed to load notifications</div>;
  }

  const iconMap = {
    success: <CheckCircle2 className="size-5 text-green-500" />,
    info: <Info className="size-5 text-sky-500" />,
    warning: <AlertTriangle className="size-5 text-amber-500" />,
    error: <XCircle className="size-5 text-red-500" />,
  };

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
          {filtered.map((notification: any) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                notification.read
                  ? "border-border bg-muted/20"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {iconMap[notification.type as keyof typeof iconMap] || <Info className="size-5 text-sky-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{notification.title}</h4>
                  {!notification.read && <div className="size-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message || notification.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ""}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="size-8" onClick={() => updateNotification(notification.id, "delete")}>
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