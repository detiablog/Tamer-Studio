"use client";

import * as React from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  title: string;
  description?: string;
  environment?: string;
  lastUpdated?: string;
  systemStatus?: "healthy" | "warning" | "critical";
  isLoading?: boolean;
}

export function DashboardHero({
  title,
  description,
  environment = "Production",
  lastUpdated,
  systemStatus = "healthy",
  isLoading = false,
}: DashboardHeroProps) {
  const getStatusIcon = () => {
    switch (systemStatus) {
      case "healthy":
        return <CheckCircle className="size-4 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="size-4 text-amber-500" />;
      case "critical":
        return <AlertCircle className="size-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case "healthy":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case "healthy":
        return "Healthy";
      case "warning":
        return "Warnings";
      case "critical":
        return "Critical";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/40 p-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-muted rounded-lg" />
          <div className="h-5 w-96 bg-muted rounded-lg" />
          <div className="flex gap-8 pt-4">
            <div className="h-4 w-32 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm p-8 transition-all hover:border-border/80 hover:shadow-md dark:from-card dark:via-card/95 dark:to-card/90">
      {/* Header */}
      <div className="space-y-3 mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/30">
        {/* Environment Badge */}
        <div className="flex items-center gap-2.5 pt-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Environment
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/15 border border-primary/20 text-xs font-semibold">
            <span className="size-1.5 rounded-full bg-primary/60" />
            {environment}
          </span>
        </div>

        {/* System Status Badge */}
        <div className="flex items-center gap-2.5 pt-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors",
              getStatusColor()
            )}
          >
            {getStatusIcon()}
            {getStatusText()}
          </span>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center gap-2.5 pt-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Updated
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{lastUpdated}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
