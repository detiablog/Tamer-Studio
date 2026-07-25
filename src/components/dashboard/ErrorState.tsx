"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-red-500/10">
          <AlertTriangle className="size-6 text-red-500" />
        </div>
      </div>
      <h3 className="font-semibold text-foreground mb-2">Failed to load dashboard</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
      )}
    </div>
  );
}
