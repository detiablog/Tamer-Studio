"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw, Download, Calendar, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_ANALYTICS = [
  { id: "a_1", date: "23/07/2026", pageViews: 12450, uniqueVisitors: 8230, bounceRate: "32.4%", avgDuration: "4m 23s", conversions: 342, revenue: "$8,420" },
  { id: "a_2", date: "22/07/2026", pageViews: 11890, uniqueVisitors: 7890, bounceRate: "34.1%", avgDuration: "3m 58s", conversions: 298, revenue: "$7,150" },
  { id: "a_3", date: "21/07/2026", pageViews: 13200, uniqueVisitors: 8750, bounceRate: "31.8%", avgDuration: "4m 45s", conversions: 389, revenue: "$9,210" },
  { id: "a_4", date: "20/07/2026", pageViews: 10980, uniqueVisitors: 7320, bounceRate: "35.2%", avgDuration: "3m 42s", conversions: 267, revenue: "$6,340" },
  { id: "a_5", date: "19/07/2026", pageViews: 11560, uniqueVisitors: 7650, bounceRate: "33.7%", avgDuration: "4m 10s", conversions: 312, revenue: "$7,890" },
];

export default function AnalyticsPage() {
  const [data, setData] = React.useState(MOCK_ANALYTICS);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [dateRange, setDateRange] = React.useState("7d");

  const filtered = data.filter((a) => a.date.toLowerCase().includes(search.toLowerCase()));

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setData(MOCK_ANALYTICS); setLoading(false); toast.success("Analytics refreshed"); }, 800);
  };

  const handleExportCSV = () => {
    const headers = "Date,Page Views,Visitors,Bounce Rate,Avg Duration,Conversions,Revenue\n";
    const rows = data.map((a) => `${a.date},${a.pageViews},${a.uniqueVisitors},${a.bounceRate},${a.avgDuration},${a.conversions},${a.revenue}`).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateRange}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  };

  const handleExportPNG = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 400);
      ctx.fillStyle = "#000000";
      ctx.font = "24px sans-serif";
      ctx.fillText("Analytics Chart Export", 20, 40);
      ctx.font = "16px sans-serif";
      ctx.fillText(`Date Range: ${dateRange}`, 20, 80);
      ctx.fillText(`Total Page Views: ${data.reduce((acc, a) => acc + a.pageViews, 0).toLocaleString()}`, 20, 120);
      ctx.fillText(`Total Visitors: ${data.reduce((acc, a) => acc + a.uniqueVisitors, 0).toLocaleString()}`, 20, 150);
      ctx.fillText(`Total Revenue: $${data.reduce((acc, a) => acc + parseInt(a.revenue.replace(/[$,]/g, "")), 0).toLocaleString()}`, 20, 180);
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${dateRange}.png`;
      link.click();
      toast.success("Chart exported as PNG");
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Analytics" }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">View platform analytics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="mr-2 size-4" />CSV</Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}><Download className="mr-2 size-4" />JSON</Button>
            <Button variant="outline" size="sm" onClick={handleExportPNG}><Download className="mr-2 size-4" />PNG</Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}><RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />Refresh</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Page Views</p>
            <p className="mt-2 text-2xl font-semibold">{data.reduce((acc, a) => acc + a.pageViews, 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+12% vs last period</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Unique Visitors</p>
            <p className="mt-2 text-2xl font-semibold">{data.reduce((acc, a) => acc + a.uniqueVisitors, 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+8% vs last period</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Conversions</p>
            <p className="mt-2 text-2xl font-semibold">{data.reduce((acc, a) => acc + a.conversions, 0)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+5% vs last period</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="mt-2 text-2xl font-semibold">${data.reduce((acc, a) => acc + parseInt(a.revenue.replace(/[$,]/g, "")), 0).toLocaleString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1"><TrendingUp className="size-3" />+15% vs last period</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by date..." className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(a) => a.id}
          columns={[
            { key: "date", header: "Date", sortable: true, render: (a: any) => <span className="text-sm font-medium">{a.date}</span> },
            { key: "pageViews", header: "Page Views", sortable: true, render: (a: any) => <span className="text-sm">{a.pageViews.toLocaleString()}</span> },
            { key: "uniqueVisitors", header: "Visitors", sortable: true, render: (a: any) => <span className="text-sm">{a.uniqueVisitors.toLocaleString()}</span> },
            { key: "bounceRate", header: "Bounce Rate", sortable: true, render: (a: any) => <Badge tone={parseFloat(a.bounceRate) > 35 ? "warning" : "success"}>{a.bounceRate}</Badge> },
            { key: "avgDuration", header: "Avg Duration", render: (a: any) => <span className="text-sm">{a.avgDuration}</span> },
            { key: "conversions", header: "Conversions", sortable: true, render: (a: any) => <span className="text-sm">{a.conversions}</span> },
            { key: "revenue", header: "Revenue", render: (a: any) => <span className="text-sm font-medium">{a.revenue}</span> },
          ]}
        />
      </DashboardCard>
    </div>
  );
}