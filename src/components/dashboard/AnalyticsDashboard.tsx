"use client";

import * as React from "react";
import {
  LineChartMetrics,
  AreaChartMetrics,
  BarChartMetrics,
  PieChartMetrics,
  ChartDataPoint,
  generateTimeSeriesData,
  generateCategoryData,
  generateDistributionData,
} from "./ChartComponents";
import { BarChart3, TrendingUp, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnalyticsDashboardProps {
  title?: string;
  description?: string;
  tabs?: ChartTab[];
  defaultTab?: string;
  showMetrics?: boolean;
  isLoading?: boolean;
  data?: {
    timeSeries?: ChartDataPoint[];
    categories?: Array<{ name: string; value: number }>;
    distribution?: Array<{ name: string; value: number }>;
  };
}

const DEFAULT_TABS: ChartTab[] = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance" },
  { id: "distribution", label: "Distribution" },
];

export function AnalyticsDashboard({
  title = "Analytics",
  description = "Platform metrics and performance",
  tabs = DEFAULT_TABS,
  defaultTab = "overview",
  showMetrics = true,
  isLoading = false,
  data,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  // Use provided data or generate sample data
  const timeSeriesData = data?.timeSeries || generateTimeSeriesData(14);
  const categoryData = data?.categories || generateCategoryData();
  const distributionData = data?.distribution || generateDistributionData();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/40 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-64 w-full bg-muted rounded-lg" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6">
        {activeTab === "overview" && (
          <>
            {/* Time Series - Users */}
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">User Growth</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Daily active users over the last 2 weeks
                </p>
              </div>
              <LineChartMetrics
                data={timeSeriesData}
                dataKey="users"
                name="Active Users"
                stroke="#3b82f6"
                height={350}
              />
            </div>

            {/* Time Series - Jobs */}
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Job Activity</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Jobs processed per day
                </p>
              </div>
              <AreaChartMetrics
                data={timeSeriesData}
                dataKey="jobs"
                name="Jobs"
                fill="#10b981"
                height={350}
              />
            </div>
          </>
        )}

        {activeTab === "performance" && (
          <>
            {/* Bar Chart - Job Status */}
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Job Status Summary</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Current job distribution by status
                </p>
              </div>
              <BarChartMetrics
                data={categoryData}
                dataKeys={[
                  { key: "value", name: "Count", fill: "#3b82f6" },
                ]}
                height={350}
              />
            </div>

            {/* Time Series - Credits */}
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Credits Usage</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Daily credit consumption
                </p>
              </div>
              <LineChartMetrics
                data={timeSeriesData}
                dataKey="credits"
                name="Credits"
                stroke="#f59e0b"
                height={350}
              />
            </div>
          </>
        )}

        {activeTab === "distribution" && (
          <>
            {/* Pie Chart - Success Rate */}
            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Job Success Rate</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall job completion status
                </p>
              </div>
              <PieChartMetrics data={distributionData} height={350} />
            </div>

            {/* Stacked Metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              {categoryData.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-border/30 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        {item.name}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {item.value}
                      </p>
                    </div>
                    <div
                      className="size-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Metrics Summary */}
      {showMetrics && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Total Users
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {timeSeriesData[timeSeriesData.length - 1]?.users || 0}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="size-3" />
              +12% this month
            </p>
          </div>

          <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Jobs This Week
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {timeSeriesData
                .reduce((sum, d) => sum + (d.jobs as number), 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
              <TrendingUp className="size-3" />
              +8% vs last week
            </p>
          </div>

          <div className="rounded-lg border border-border/30 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {distributionData[0]?.value || 0}%
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="size-3" />
              98.2% uptime
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
