"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Activity,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface HealthStatus {
  id: string;
  label: string;
  status: "healthy" | "warning" | "critical" | "running";
  icon?: React.ReactNode;
  detail?: string;
}

interface HealthPanelProps {
  title?: string;
  items: HealthStatus[];
  isLoading?: boolean;
}

function getStatusStyles(status: string) {
  switch (status) {
    case "healthy":
      return {
        badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-500",
        icon: <CheckCircle2 className="size-4" />,
        label: "Healthy",
      };
    case "running":
      return {
        badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        dot: "bg-blue-500",
        icon: <Activity className="size-4" />,
        label: "Running",
      };
    case "warning":
      return {
        badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        dot: "bg-amber-500",
        icon: <AlertCircle className="size-4" />,
        label: "Warning",
      };
    case "critical":
      return {
        badge: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
        dot: "bg-red-500",
        icon: <XCircle className="size-4" />,
        label: "Critical",
      };
    default:
      return {
        badge: "bg-muted text-muted-foreground border-border",
        dot: "bg-muted-foreground",
        icon: <HardDrive className="size-4" />,
        label: "Unknown",
      };
  }
}

export function HealthPanel({
  title = "System Health",
  items,
  isLoading = false,
}: HealthPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all hover:border-border/80 hover:shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground text-base">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            All Systems
          </span>
        </div>
      </div>

      {/* Health Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const styles = getStatusStyles(item.status);

          return (
            <div key={item.id} className="group">
              <div className="flex items-center justify-between py-3 px-3 rounded-lg transition-colors hover:bg-muted/30">
                {/* Label + Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {item.icon || (
                      <div className={cn("size-2 rounded-full flex-shrink-0", styles.dot)} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.label}
                    </p>
                    {item.detail && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ml-2",
                    styles.badge
                  )}
                >
                  {styles.icon}
                  {styles.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
