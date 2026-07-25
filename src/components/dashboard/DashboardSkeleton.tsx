"use client";

import * as React from "react";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-muted/40 p-8">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-muted rounded-lg" />
          <div className="h-5 w-96 max-w-full bg-muted rounded-lg" />
          <div className="flex gap-8 pt-4 flex-wrap">
            <div className="h-4 w-32 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded-lg" />
            <div className="h-4 w-32 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-muted/40 p-6"
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

      {/* Panels Skeleton */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-muted/40 p-6"
          >
            <div className="space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated skeleton loader for gradual content reveal
 * Use for perceived performance improvement
 */
export function SkeletonPulse() {
  return (
    <style>{`
      @keyframes skeleton-loading {
        0% {
          background-color: hsl(var(--muted) / 0.4);
        }
        50% {
          background-color: hsl(var(--muted) / 0.6);
        }
        100% {
          background-color: hsl(var(--muted) / 0.4);
        }
      }
      
      .animate-skeleton {
        animation: skeleton-loading 2s infinite;
      }
    `}</style>
  );
}
