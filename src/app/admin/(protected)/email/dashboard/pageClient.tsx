"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Send, CheckCircle, XCircle, Activity, Clock, Zap, Server, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DashboardData = {
  emailsSentToday: number;
  emailsSentYesterday: number;
  successRate: number;
  failedRate: number;
  queueSize: number;
  avgSendTime: number;
  smtpHealth: "healthy" | "offline" | "unknown";
  mostUsedTemplates: Array<{ name: string; count: number }>;
  topFailureReasons: Array<{ reason: string; count: number }>;
  dailyVolume: Array<{ date: string; sent: number; delivered: number; failed: number }>;
  weeklyVolume: Array<{ date: string; sent: number; delivered: number; failed: number }>;
  monthlyVolume: Array<{ date: string; sent: number; delivered: number; failed: number }>;
};

const MOCK_DATA: DashboardData = {
  emailsSentToday: 1234,
  emailsSentYesterday: 1180,
  successRate: 96.2,
  failedRate: 3.8,
  queueSize: 47,
  avgSendTime: 342,
  smtpHealth: "healthy",
  mostUsedTemplates: [
    { name: "Email Verification", count: 456 },
    { name: "Password Reset", count: 234 },
    { name: "Payment Success", count: 189 },
    { name: "Welcome Email", count: 145 },
    { name: "Subscription Confirmation", count: 98 },
  ],
  topFailureReasons: [
    { reason: "Mailbox full", count: 23 },
    { reason: "Invalid email address", count: 18 },
    { reason: "Connection timeout", count: 12 },
    { reason: "DNS resolution failed", count: 8 },
    { reason: "SMTP authentication error", count: 5 },
  ],
  dailyVolume: [
    { date: "Mon", sent: 120, delivered: 115, failed: 5 },
    { date: "Tue", sent: 98, delivered: 96, failed: 2 },
    { date: "Wed", sent: 145, delivered: 140, failed: 5 },
    { date: "Thu", sent: 87, delivered: 85, failed: 2 },
    { date: "Fri", sent: 132, delivered: 128, failed: 4 },
    { date: "Sat", sent: 56, delivered: 55, failed: 1 },
    { date: "Sun", sent: 48, delivered: 47, failed: 1 },
  ],
  weeklyVolume: [
    { date: "Week 1", sent: 780, delivered: 755, failed: 25 },
    { date: "Week 2", sent: 820, delivered: 800, failed: 20 },
    { date: "Week 3", sent: 910, delivered: 890, failed: 20 },
    { date: "Week 4", sent: 1050, delivered: 1025, failed: 25 },
  ],
  monthlyVolume: [
    { date: "Jan", sent: 3200, delivered: 3100, failed: 100 },
    { date: "Feb", sent: 2800, delivered: 2720, failed: 80 },
    { date: "Mar", sent: 3500, delivered: 3400, failed: 100 },
    { date: "Apr", sent: 4100, delivered: 4000, failed: 100 },
    { date: "May", sent: 3800, delivered: 3700, failed: 100 },
    { date: "Jun", sent: 4200, delivered: 4100, failed: 100 },
    { date: "Jul", sent: 4500, delivered: 4400, failed: 100 },
    { date: "Aug", sent: 3900, delivered: 3800, failed: 100 },
    { date: "Sep", sent: 4000, delivered: 3900, failed: 100 },
    { date: "Oct", sent: 4300, delivered: 4200, failed: 100 },
    { date: "Nov", sent: 4100, delivered: 4000, failed: 100 },
    { date: "Dec", sent: 4600, delivered: 4500, failed: 100 },
  ],
};

type MonitoringDashboardPageProps = {
  adminToken: string | null;
};

function getSuccessRateColor(rate: number): string {
  if (rate > 95) return "text-green-500";
  if (rate > 80) return "text-yellow-500";
  return "text-red-500";
}

function getSuccessRateTone(rate: number): "success" | "warning" | "default" {
  if (rate > 95) return "success";
  if (rate > 80) return "warning";
  return "default";
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export default function MonitoringDashboardPage({ adminToken }: MonitoringDashboardPageProps) {
  const { t } = useLocalizationContext();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<DashboardData | null>(null);

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email/dashboard", {
        headers: authHeaders,
      });
      if (!res.ok) {
        setData(MOCK_DATA);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
    toast.success(t("email.refreshed", "Refreshed"));
  };

  if (!data) return null;

  const trend = data.emailsSentToday - data.emailsSentYesterday;
  const trendPercent = data.emailsSentYesterday > 0
    ? ((trend / data.emailsSentYesterday) * 100).toFixed(1)
    : "0";

  const statsWidgets = [
    {
      label: t("email.monitoring.sentToday", "Emails Sent Today"),
      value: data.emailsSentToday.toLocaleString(),
      trend: `${trend >= 0 ? "+" : ""}${trendPercent}% vs yesterday`,
      trendUp: trend >= 0,
      icon: <Send className="size-4" />,
      tone: "default" as const,
    },
    {
      label: t("email.monitoring.successRate", "Success Rate"),
      value: `${data.successRate}%`,
      icon: <CheckCircle className="size-4" />,
      tone: getSuccessRateTone(data.successRate) as "success" | "warning" | "default",
      valueColor: getSuccessRateColor(data.successRate),
    },
    {
      label: t("email.monitoring.failedRate", "Failed Rate"),
      value: `${data.failedRate}%`,
      icon: <XCircle className="size-4" />,
      tone: data.failedRate < 5 ? "success" : data.failedRate < 20 ? "warning" : "default",
    },
    {
      label: t("email.monitoring.queueSize", "Queue Size"),
      value: data.queueSize.toLocaleString(),
      icon: <Activity className="size-4" />,
      tone: "info" as const,
    },
    {
      label: t("email.monitoring.avgSendTime", "Avg Send Time"),
      value: `${data.avgSendTime}ms`,
      icon: <Clock className="size-4" />,
      tone: data.avgSendTime < 500 ? "success" : data.avgSendTime < 1000 ? "warning" : "default",
    },
    {
      label: t("email.monitoring.smtpHealth", "SMTP Health"),
      value: data.smtpHealth === "healthy" ? "Healthy" : data.smtpHealth === "offline" ? "Offline" : "Unknown",
      icon: <Server className="size-4" />,
      tone: data.smtpHealth === "healthy" ? "success" : data.smtpHealth === "offline" ? "default" : "info",
      dotColor: data.smtpHealth === "healthy" ? "bg-green-500" : data.smtpHealth === "offline" ? "bg-red-500" : "bg-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email", "Email") }, { label: t("email.monitoring", "Monitoring") }]} />
      <PageHeader
        title={t("email.monitoring.dashboard", "Monitoring Dashboard")}
        description={t("email.monitoring.dashboardDescription", "Real-time email service monitoring and analytics")}
        actions={
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
            {t("email.refresh", "Refresh")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsWidgets.map((stat) => (
          <DashboardCard key={stat.label}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {stat.icon}
              {stat.label}
            </div>
            <div className={cn("text-2xl font-semibold", stat.valueColor)}>
              {stat.dotColor && (
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", stat.dotColor)} />
                  {stat.value}
                </span>
              )}
              {!stat.dotColor && stat.value}
            </div>
            {stat.trend && (
              <div className={cn("text-xs mt-1 flex items-center gap-1", stat.trendUp ? "text-green-500" : "text-red-500")}>
                {stat.trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {stat.trend}
              </div>
            )}
          </DashboardCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardCard title={t("email.monitoring.dailyVolume", "Daily Volume")} description={t("email.monitoring.last7Days", "Last 7 days")}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.dailyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="sent" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" name={t("email.sent", "Sent")} />
              <Area type="monotone" dataKey="delivered" fill="hsl(var(--green-600, 22%))" fillOpacity={0.3} stroke="#16a34a" name={t("email.delivered", "Delivered")} />
              <Area type="monotone" dataKey="failed" fill="hsl(var(--destructive))" fillOpacity={0.3} stroke="hsl(var(--destructive))" name={t("email.failed", "Failed")} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title={t("email.monitoring.weeklyVolume", "Weekly Volume")} description={t("email.monitoring.last4Weeks", "Last 4 weeks")}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="sent" fill="hsl(var(--primary))" name={t("email.sent", "Sent")} radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" fill="#16a34a" name={t("email.delivered", "Delivered")} radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="hsl(var(--destructive))" name={t("email.failed", "Failed")} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title={t("email.monitoring.monthlyVolume", "Monthly Volume")} description={t("email.monitoring.last12Months", "Last 12 months")}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "currentColor" }} />
              <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2} name={t("email.sent", "Sent")} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="delivered" stroke="#16a34a" strokeWidth={2} name={t("email.delivered", "Delivered")} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} name={t("email.failed", "Failed")} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardCard title={t("email.monitoring.mostUsedTemplates", "Most Used Templates")} description={t("email.monitoring.top5Templates", "Top 5 templates by usage")}>
          <div className="space-y-3">
            {data.mostUsedTemplates.length > 0 ? (
              data.mostUsedTemplates.map((template, i) => (
                <div key={template.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge tone="purple">{i + 1}</Badge>
                    <span className="text-sm font-medium">{template.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{template.count.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("email.monitoring.noData", "No data available")}</p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title={t("email.monitoring.topFailureReasons", "Top Failure Reasons")} description={t("email.monitoring.last30Days", "Last 30 days")}>
          <div className="space-y-3">
            {data.topFailureReasons.length > 0 ? (
              data.topFailureReasons.map((reason, i) => (
                <div key={reason.reason} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge tone="warning">{i + 1}</Badge>
                    <span className="text-sm font-medium truncate max-w-[240px]">{reason.reason}</span>
                  </div>
                  <Badge tone="default">{reason.count}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("email.monitoring.noFailures", "No failures recorded")}</p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
