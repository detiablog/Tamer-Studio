"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import { useTheme } from "next-themes";

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartConfig {
  dataKey: string;
  stroke?: string;
  fill?: string;
  name?: string;
}

// Dark theme colors aligned with dashboard
const DARK_COLORS = {
  text: "#e4e4e7",
  grid: "#27272a",
  primary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444",
  secondary: "#8b5cf6",
};

const LIGHT_COLORS = {
  text: "#18181b",
  grid: "#e4e4e7",
  primary: "#0d47a1",
  success: "#0d7045",
  warning: "#b45309",
  critical: "#991b1b",
  secondary: "#6d28d9",
};

export const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#eab308", // yellow
];

/**
 * Get theme-aware tooltip content with custom styling
 */
export function getChartTooltip(isDark: boolean) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 shadow-lg">
      {/* Tooltip content rendered by Recharts */}
    </div>
  );
}

/**
 * Get theme-aware chart colors
 */
export function getChartTheme(isDark: boolean) {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}

/**
 * Custom tooltip component for all charts
 */
export function CustomTooltip({ active, payload, label }: any) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur p-3 shadow-lg">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Line chart for tracking metrics over time
 * Used for: Users, Registrations, Credits, etc.
 */
export function LineChartMetrics({
  data,
  dataKey,
  name = "Value",
  height = 300,
  stroke = "#3b82f6",
}: {
  data: ChartDataPoint[];
  dataKey: string;
  name?: string;
  height?: number;
  stroke?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = getChartTheme(isDark);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          opacity={0.5}
        />
        <XAxis
          dataKey="name"
          stroke={colors.text}
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke={colors.text} style={{ fontSize: "12px" }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          dot={{ fill: stroke, r: 4 }}
          activeDot={{ r: 6 }}
          name={name}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Area chart for revenue or cumulative metrics
 */
export function AreaChartMetrics({
  data,
  dataKey,
  name = "Value",
  height = 300,
  fill = "#10b981",
}: {
  data: ChartDataPoint[];
  dataKey: string;
  name?: string;
  height?: number;
  fill?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = getChartTheme(isDark);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fill} stopOpacity={0.3} />
            <stop offset="95%" stopColor={fill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          opacity={0.5}
        />
        <XAxis
          dataKey="name"
          stroke={colors.text}
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke={colors.text} style={{ fontSize: "12px" }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={fill}
          fill="url(#areaGradient)"
          name={name}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Bar chart for comparing categories
 * Used for: Jobs by status, Users by plan, etc.
 */
export function BarChartMetrics({
  data,
  dataKeys,
  height = 300,
}: {
  data: ChartDataPoint[];
  dataKeys: Array<{
    key: string;
    name: string;
    fill: string;
  }>;
  height?: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = getChartTheme(isDark);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.grid}
          opacity={0.5}
        />
        <XAxis
          dataKey="name"
          stroke={colors.text}
          style={{ fontSize: "12px" }}
        />
        <YAxis stroke={colors.text} style={{ fontSize: "12px" }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        {dataKeys.map((key) => (
          <Bar
            key={key.key}
            dataKey={key.key}
            fill={key.fill}
            name={key.name}
            isAnimationActive={true}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Pie chart for distribution/composition
 * Used for: Success vs Failed, Plan distribution, etc.
 */
export function PieChartMetrics({
  data,
  height = 300,
}: {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  height?: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Sample data generators for demonstration
 */
export function generateTimeSeriesData(days: number = 7) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: Math.floor(Math.random() * 500) + 200,
      jobs: Math.floor(Math.random() * 300) + 100,
      credits: Math.floor(Math.random() * 1000) + 500,
    });
  }

  return data;
}

export function generateCategoryData() {
  return [
    { name: "Completed", value: 450, fill: "#10b981" },
    { name: "Running", value: 120, fill: "#3b82f6" },
    { name: "Queued", value: 80, fill: "#f59e0b" },
    { name: "Failed", value: 30, fill: "#ef4444" },
  ];
}

export function generateDistributionData() {
  return [
    { name: "Success", value: 92, fill: "#10b981" },
    { name: "Failed", value: 8, fill: "#ef4444" },
  ];
}
