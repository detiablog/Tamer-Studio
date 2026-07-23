"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardMetrics } from "@/core/analytics/aggregation";

interface AnalyticsDashboardProps {
  workspaceId: string;
}

const COLORS = ["#0f172a", "#1e293b", "#64748b", "#cbd5e1", "#e2e8f0"];

export function AnalyticsDashboard({ workspaceId }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics/dashboard?workspaceId=${workspaceId}`
        );
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!metrics) return <div className="p-8">No data available</div>;

  return (
    <div className="space-y-8 p-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Productions"
          value={metrics.totalProductions}
          subtext="Last 30 days"
        />
        <MetricCard
          label="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          subtext={`${Math.round(metrics.totalProductions * (metrics.successRate / 100))} succeeded`}
        />
        <MetricCard
          label="Total Cost"
          value={`$${parseFloat(metrics.totalCostUsd).toFixed(2)}`}
          subtext="USD"
        />
        <MetricCard
          label="Avg Execution"
          value={`${Math.round(metrics.averageExecutionTime / 1000)}s`}
          subtext="per production"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Trend */}
        <div className="col-span-1 lg:col-span-2 rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Production Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0f172a"
                name="Total"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#22c55e"
                name="Succeeded"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Models */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Top AI Models</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.topModels}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, count }) => `${model}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.topModels.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Activity */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">User Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.userActivity}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="action" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#0f172a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model Cost Breakdown */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Cost Breakdown by Model</h3>
        <div className="space-y-3">
          {metrics.topModels.map((model) => (
            <div key={model.model} className="flex items-center justify-between">
              <span className="text-sm">{model.model}</span>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(parseFloat(model.cost) / parseFloat(metrics.totalCostUsd)) * 100 || 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium min-w-16">
                  ${parseFloat(model.cost).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

function MetricCard({ label, value, subtext }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}
