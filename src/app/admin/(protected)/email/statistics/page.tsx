"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Download, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

type DailyStat = {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
  bounce: number;
};

type ProviderStat = {
  provider: string;
  sent: number;
  delivered: number;
  failed: number;
  bounce: number;
};

const MOCK_HISTORY: DailyStat[] = [
  { date: "Mon", sent: 120, delivered: 115, failed: 3, bounce: 2 },
  { date: "Tue", sent: 98, delivered: 96, failed: 1, bounce: 1 },
  { date: "Wed", sent: 145, delivered: 140, failed: 4, bounce: 1 },
  { date: "Thu", sent: 87, delivered: 85, failed: 2, bounce: 0 },
  { date: "Fri", sent: 132, delivered: 128, failed: 3, bounce: 1 },
  { date: "Sat", sent: 56, delivered: 55, failed: 1, bounce: 0 },
  { date: "Sun", sent: 48, delivered: 47, failed: 1, bounce: 0 },
];

const MOCK_PROVIDER_STATS: ProviderStat[] = [
  { provider: "SMTP", sent: 200, delivered: 195, failed: 3, bounce: 2 },
  { provider: "SendGrid", sent: 150, delivered: 148, failed: 2, bounce: 0 },
  { provider: "Resend", sent: 120, delivered: 118, failed: 2, bounce: 0 },
  { provider: "Amazon SES", sent: 80, delivered: 79, failed: 1, bounce: 0 },
  { provider: "Mailgun", sent: 0, delivered: 0, failed: 0, bounce: 0 },
  { provider: "Postmark", sent: 90, delivered: 90, failed: 0, bounce: 0 },
];

export default function StatisticsPage() {
  const { t } = useLocalizationContext();
  const [dateRange, setDateRange] = React.useState("7d");
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<DailyStat[]>(MOCK_HISTORY);
  const [providerStats, setProviderStats] = React.useState<ProviderStat[]>(MOCK_PROVIDER_STATS);

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/email/statistics?range=${dateRange}`).then(r => r.json()),
      fetch(`/api/admin/email/statistics/providers?range=${dateRange}`).then(r => r.json()),
    ]).then(([histData, provData]) => {
      if (Array.isArray(histData)) setHistory(histData);
      if (Array.isArray(provData)) setProviderStats(provData);
    })
      .catch(() => toast.error(t("email.loadStatsFailed")))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const handleExportCSV = () => {
    const headers = ["Date", "Sent", "Delivered", "Failed", "Bounce"];
    const rows = history.map(d => [d.date, d.sent, d.delivered, d.failed, d.bounce]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-statistics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("email.csvExported"));
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.statistics") }]} />
      <PageHeader
        title={t("email.statistics")}
        description={t("email.statisticsDescription")}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 size-4" />
              {t("email.exportCSV")}
            </Button>
            <Button onClick={fetchStats} disabled={loading}>
              <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
              {t("email.refresh")}
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <Calendar className="size-4 text-muted-foreground" />
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="1d">{t("email.lastDay")}</option>
          <option value="7d">{t("email.last7Days")}</option>
          <option value="30d">{t("email.last30Days")}</option>
          <option value="90d">{t("email.last90Days")}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardCard>
          <h3 className="font-heading text-sm font-semibold mb-3">{t("email.sentOverTime")}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Legend />
              <Area type="monotone" dataKey="sent" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" name={t("email.sent")} />
              <Area type="monotone" dataKey="delivered" fill="hsl(var(--green-600))" fillOpacity={0.3} stroke="hsl(var(--green-600))" name={t("email.delivered")} />
              <Area type="monotone" dataKey="failed" fill="hsl(var(--destructive))" fillOpacity={0.3} stroke="hsl(var(--destructive))" name={t("email.failed")} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard>
          <h3 className="font-heading text-sm font-semibold mb-3">{t("email.bounceOverTime")}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="bounce" stroke="hsl(var(--amber-500))" strokeWidth={2} name={t("email.bounce")} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} name={t("email.failed")} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      <DashboardCard>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h3 className="font-heading text-sm font-semibold">{t("email.providerBreakdown")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.provider")}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t("email.sent")}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t("email.delivered")}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t("email.failed")}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t("email.bounce")}</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t("email.deliveryRate")}</th>
              </tr>
            </thead>
            <tbody>
              {providerStats.map(stat => (
                <tr key={stat.provider} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{stat.provider}</td>
                  <td className="px-4 py-3 text-right">{stat.sent}</td>
                  <td className="px-4 py-3 text-right">{stat.delivered}</td>
                  <td className="px-4 py-3 text-right text-destructive">{stat.failed}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{stat.bounce}</td>
                  <td className="px-4 py-3 text-right">
                    {stat.sent > 0 ? (
                      <Badge tone="success">{((stat.delivered / stat.sent) * 100).toFixed(1)}%</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}