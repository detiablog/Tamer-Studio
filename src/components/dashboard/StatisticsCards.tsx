"use client";

import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down";
  };
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "info" | "critical";
}

interface StatisticsCardsProps {
  cards: StatCard[];
  isLoading?: boolean;
  columns?: number;
}

function getVariantClasses(variant: string) {
  switch (variant) {
    case "success":
      return {
        icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        trend: "text-emerald-600 dark:text-emerald-400",
      };
    case "warning":
      return {
        icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        trend: "text-amber-600 dark:text-amber-400",
      };
    case "critical":
      return {
        icon: "bg-red-500/15 text-red-600 dark:text-red-400",
        trend: "text-red-600 dark:text-red-400",
      };
    case "info":
      return {
        icon: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        trend: "text-blue-600 dark:text-blue-400",
      };
    default:
      return {
        icon: "bg-primary/15 text-primary",
        trend: "text-primary",
      };
  }
}

export function StatisticsCards({
  cards,
  isLoading = false,
  columns = 4,
}: StatisticsCardsProps) {
  const gridClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns] || "sm:grid-cols-2 lg:grid-cols-4";

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 md:gap-6", gridClass)}>
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-6 animate-pulse"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="size-10 bg-muted rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", gridClass)}>
      {cards.map((card) => {
        const variants = getVariantClasses(card.variant || "default");
        const Icon = card.icon;
        const TrendIcon = card.trend?.direction === "up" ? TrendingUp : TrendingDown;

        return (
          <div
            key={card.id}
            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-border/80 hover:bg-card/60 hover:shadow-md dark:hover:shadow-dark"
          >
            {/* Gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Content */}
            <div className="relative space-y-4">
              {/* Header: Title + Icon */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </h3>
                <div
                  className={cn(
                    "rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110",
                    variants.icon
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </div>

              {/* Value + Trend */}
              <div className="space-y-2">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {card.value}
                </p>

                {card.trend ? (
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold",
                      variants.trend
                    )}
                  >
                    <TrendIcon className="size-3.5" />
                    <span>
                      {card.trend.direction === "up" ? "+" : "-"}
                      {Math.abs(card.trend.value)}% {card.trend.label}
                    </span>
                  </div>
                ) : null}

                {card.subtitle && (
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
