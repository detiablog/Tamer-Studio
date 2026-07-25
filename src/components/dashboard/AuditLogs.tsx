"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuditLogEntry {
  id: string;
  user?: string;
  userAvatar?: string;
  action: string;
  actionType?: "create" | "update" | "delete" | "view" | "login" | "logout";
  status?: "success" | "warning" | "error";
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

interface AuditLogsProps {
  title?: string;
  entries: AuditLogEntry[];
  isLoading?: boolean;
  onViewMore?: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  maxItems?: number;
}

function getActionIcon(actionType?: string) {
  switch (actionType) {
    case "create":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "update":
      return <Edit className="size-4 text-blue-500" />;
    case "delete":
      return <Trash2 className="size-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="size-4 text-amber-500" />;
    case "error":
      return <XCircle className="size-4 text-red-500" />;
    default:
      return <CheckCircle2 className="size-4 text-primary" />;
  }
}

function getActionColor(actionType?: string) {
  switch (actionType) {
    case "create":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "update":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "delete":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    case "login":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "logout":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    default:
      return "bg-primary/15 text-primary border-primary/30";
  }
}

function getInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AuditLogs({
  title = "Audit Logs",
  entries,
  isLoading = false,
  onViewMore,
  emptyMessage = "No recent activity",
  emptyDescription = "Your audit logs will appear here once users begin interacting with the platform.",
  maxItems = 5,
}: AuditLogsProps) {
  const displayedEntries = entries.slice(0, maxItems);
  const hasMore = entries.length > maxItems;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="size-8 bg-muted rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all hover:border-border/80 hover:shadow-sm">
        {/* Header */}
        <h3 className="font-semibold text-foreground text-base mb-6 pb-4 border-b border-border/30">
          {title}
        </h3>

        {/* Empty State */}
        <div className="py-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-muted/50">
              <Clock className="size-6 text-muted-foreground/60" />
            </div>
          </div>
          <h4 className="font-medium text-foreground mb-2">{emptyMessage}</h4>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all hover:border-border/80 hover:shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground text-base">{title}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full">
          {entries.length} total
        </span>
      </div>

      {/* Logs List */}
      <div className="space-y-3 flex-1">
        {displayedEntries.map((entry, index) => (
          <div
            key={entry.id}
            className={cn(
              "group p-4 rounded-lg border border-border/30 transition-all hover:border-border/60 hover:bg-muted/20",
              index === 0 && "ring-1 ring-primary/20 bg-primary/5 dark:bg-primary/10"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Avatar */}
                {entry.userAvatar ? (
                  <img
                    src={entry.userAvatar}
                    alt={entry.user}
                    className="size-8 rounded-full flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="size-8 rounded-full flex-shrink-0 bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
                    {getInitials(entry.user)}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  {/* User + Action */}
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.user ? (
                      <>
                        <span className="font-semibold">{entry.user}</span>
                        <span className="text-muted-foreground font-normal"> {entry.action}</span>
                      </>
                    ) : (
                      entry.action
                    )}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{entry.timestamp}</span>
                    </div>
                    {entry.ipAddress && (
                      <span className="text-xs text-muted-foreground/60 truncate">
                        {entry.ipAddress}
                      </span>
                    )}
                  </div>

                  {entry.details && (
                    <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
                      {entry.details}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Badge + Menu */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Action Badge */}
                {entry.actionType && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all whitespace-nowrap",
                      getActionColor(entry.actionType)
                    )}
                  >
                    {getActionIcon(entry.actionType)}
                    {entry.actionType.charAt(0).toUpperCase() + entry.actionType.slice(1)}
                  </div>
                )}

                {/* Menu (optional) */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted/50 rounded-lg">
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More */}
      {hasMore && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <button
            onClick={onViewMore}
            className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2.5 rounded-lg hover:bg-muted/30"
          >
            View {entries.length - maxItems} more entries
          </button>
        </div>
      )}
    </div>
  );
}
