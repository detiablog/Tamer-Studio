"use client";

import * as React from "react";
import {
  LineChartMetrics,
  AreaChartMetrics,
  BarChartMetrics,
  PieChartMetrics,
  ChartDataPoint,
  generateTimeSeriesData,
} from "./ChartComponents";
import { BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  variant?: "default" | "success" | "warning" | "critical";
}

interface AnalyticsPanelProps {
  title?: string;
  description?: string;
  metrics: AnalyticsMetric[];
  hasChart?: boolean;
  chartHeight?: "sm" | "md" | "lg";
  chartType?: "line" | "area" | "bar" | "pie";
  chartData?: ChartDataPoint[];
  chartDataKey?: string;
  chartLabel?: string;
  isLoading?: boolean;
}

function getTrendColor(variant?: string) {
  switch (variant) {
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    case "critical":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

const chartHeights = {
  sm: "h-32",
  md: "h-48",
  lg: "h-64",
};

export function AnalyticsPanel({
  title = "Analytics",
  description,
  metrics,
  hasChart = true,
  chartHeight = "md",
  chartType = "line",
  chartData,
  chartDataKey = "value",
  chartLabel = "Value",
  isLoading = false,
}: AnalyticsPanelProps) {
  // Generate sample data if not provided
  const displayData = chartData || generateTimeSeriesData(7);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          {hasChart && (
            <div
              className={cn("w-full bg-muted rounded-lg", chartHeights[chartHeight])}
            />
          )}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const heightMap = { sm: 200, md: 300, lg: 400 };
    const height = heightMap[chartHeight] || 300;

    switch (chartType) {
      case "area":
        return (
          <AreaChartMetrics
            data={displayData}
            dataKey={chartDataKey}
            name={chartLabel}
            height={height}
            fill="#10b981"
          />
        );
      case "bar":
        return (
          <BarChartMetrics
            data={displayData}
            dataKeys={[{ key: chartDataKey, name: chartLabel, fill: "#3b82f6" }]}
            height={height}
          />
        );
      case "pie":
        return <PieChartMetrics data={displayData as any} height={height} />;
      case "line":
      default:
        return (
          <LineChartMetrics
            data={displayData}
            dataKey={chartDataKey}
            name={chartLabel}
            height={height}
            stroke="#3b82f6"
          />
        );
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all hover:border-border/80 hover:shadow-sm flex flex-col">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground text-base">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Chart */}
      {hasChart && <div className="mb-6">{renderChart()}</div>}

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 flex-1">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="p-4 rounded-lg bg-muted/20 border border-border/30 transition-colors hover:bg-muted/30 hover:border-border/50"
          >
            <div className="space-y-2">
              {/* Label */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </p>

              {/* Value */}
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  {metric.unit && (
                    <span className="text-xs text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </div>

                {/* Trend */}
                {metric.trend !== undefined && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold",
                      getTrendColor(metric.variant)
                    )}
                  >
                    <TrendingUp className="size-3" />
                    {metric.trend > 0 ? "+" : ""}
                    {metric.trend}%
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
