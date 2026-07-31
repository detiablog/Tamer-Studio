"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RefreshCw, Mail, Clock, Send, XCircle, AlertTriangle, RotateCcw, Trash2,
  Search, ChevronDown, ChevronUp, Ban,
  ArrowUpDown, Calendar, Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type QueueItem = {
  id: string;
  type: string;
  to: string;
  subject: string;
  status: "queued" | "processing" | "sent" | "failed" | "cancelled";
  priority: string;
  attempts: number;
  maxAttempts: number;
  providerId: string;
  providerName: string;
  category: string;
  scheduledAt: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  smtpResponse: string | null;
  metadata: Record<string, unknown> | null;
};

type QueueStats = {
  total: number;
  queued: number;
  processing: number;
  sent: number;
  failed: number;
  cancelled: number;
  scheduled: number;
};

const PAGE_SIZES = [10, 20, 50, 100];

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  normal: "bg-muted text-foreground",
  low: "bg-muted/60 text-muted-foreground",
};

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "info" | "muted"> = {
  queued: "info",
  processing: "default",
  sent: "success",
  failed: "warning",
  cancelled: "muted",
};

type SortField = "createdAt" | "type" | "to" | "subject" | "status" | "attempts" | "priority";
type SortDir = "asc" | "desc";

type QueuePageProps = {
  adminToken: string | null;
};

export default function QueuePage({ adminToken }: QueuePageProps) {
  const { t } = useLocalizationContext();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<QueueItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterType, setFilterType] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [deleteConfirmIds, setDeleteConfirmIds] = React.useState<string[] | null>(null);

  const [stats, setStats] = React.useState<QueueStats>({
    total: 0, queued: 0, processing: 0, sent: 0, failed: 0, cancelled: 0, scheduled: 0,
  });

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  const fetchQueue = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterType) params.set("type", filterType);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/email/queue?${params.toString()}`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load queue");
      const data = await res.json();

      const queueItems: QueueItem[] = (data.data || []).map((item: Record<string, unknown>) => ({
        id: String(item.id || ""),
        type: String(item.type || ""),
        to: String(item.to || ""),
        subject: String(item.subject || ""),
        status: String(item.status || "queued") as QueueItem["status"],
        priority: String(item.priority || "normal"),
        attempts: Number(item.attempts || 0),
        maxAttempts: Number(item.maxAttempts || 3),
        providerId: String(item.providerId || ""),
        providerName: String(item.providerName || item.provider || ""),
        category: String(item.category || ""),
        scheduledAt: item.scheduledAt ? String(item.scheduledAt) : null,
        createdAt: String(item.createdAt || ""),
        startedAt: item.startedAt ? String(item.startedAt) : null,
        completedAt: item.completedAt ? String(item.completedAt) : null,
        errorMessage: item.errorMessage ? String(item.errorMessage) : null,
        smtpResponse: item.smtpResponse ? String(item.smtpResponse) : null,
        metadata: (item.metadata as Record<string, unknown>) || null,
      }));

      setItems(queueItems);
      setTotal(data.total || queueItems.length);
      setTotalPages(data.totalPages || 1);

      const allStatuses = queueItems;
      setStats({
        total: data.total || allStatuses.length,
        queued: allStatuses.filter((i: QueueItem) => i.status === "queued").length,
        processing: allStatuses.filter((i: QueueItem) => i.status === "processing").length,
        sent: allStatuses.filter((i: QueueItem) => i.status === "sent").length,
        failed: allStatuses.filter((i: QueueItem) => i.status === "failed").length,
        cancelled: allStatuses.filter((i: QueueItem) => i.status === "cancelled").length,
        scheduled: allStatuses.filter((i: QueueItem) => i.scheduledAt && !i.completedAt).length,
      });
    } catch {
      toast.error(t("email.loadError", "Failed to load queue"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterStatus, filterType, dateFrom, dateTo, authHeaders, t]);

  React.useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedItems = React.useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      else if (sortField === "to") cmp = a.to.localeCompare(b.to);
      else if (sortField === "subject") cmp = a.subject.localeCompare(b.subject);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "attempts") cmp = a.attempts - b.attempts;
      else if (sortField === "priority") {
        const order: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
        cmp = (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [items, sortField, sortDir]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedItems.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleRetry = async (ids: string[]) => {
    try {
      const res = await fetch("/api/admin/email/queue", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("email.retrySuccess", "Items queued for retry"));
        setSelectedIds(new Set());
        fetchQueue();
      } else {
        toast.error(data.error || t("email.retryFailed", "Failed to retry"));
      }
    } catch {
      toast.error(t("email.retryFailed", "Failed to retry"));
    }
  };

  const handleCancel = async (ids: string[]) => {
    try {
      let successCount = 0;
      for (const id of ids) {
        const res = await fetch(`/api/admin/email/queue/${id}/cancel`, {
          method: "POST",
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success) successCount++;
      }
      if (successCount > 0) {
        toast.success(t("email.cancelSuccess", `${successCount} item(s) cancelled`));
        setSelectedIds(new Set());
        fetchQueue();
      }
    } catch {
      toast.error(t("email.cancelFailed", "Failed to cancel"));
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      let successCount = 0;
      for (const id of ids) {
        const res = await fetch(`/api/admin/email/queue/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success) successCount++;
      }
      if (successCount > 0) {
        toast.success(t("email.deleteSuccess", `${successCount} item(s) deleted`));
        setSelectedIds(new Set());
        setDeleteConfirmIds(null);
        fetchQueue();
      }
    } catch {
      toast.error(t("email.deleteFailed", "Failed to delete"));
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 opacity-40" />;
    return sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email", "Email") }, { label: t("email.queue", "Queue") }]} />
      <PageHeader
        title={t("email.queue", "Email Queue")}
        description={t("email.queueDescription", "Monitor and manage email queue items")}
        actions={
          <Button onClick={fetchQueue} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 size-3.5", loading && "animate-spin")} />
            {t("email.refresh", "Refresh")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: t("email.total", "Total"), value: stats.total, icon: <Mail className="size-4" />, tone: "default" as const },
          { label: t("email.queued", "Queued"), value: stats.queued, icon: <Clock className="size-4" />, tone: "info" as const },
          { label: t("email.processing", "Processing"), value: stats.processing, icon: <Activity className="size-4" />, tone: "default" as const },
          { label: t("email.sent", "Sent"), value: stats.sent, icon: <Send className="size-4" />, tone: "success" as const },
          { label: t("email.failed", "Failed"), value: stats.failed, icon: <AlertTriangle className="size-4" />, tone: "warning" as const },
          { label: t("email.cancelled", "Cancelled"), value: stats.cancelled, icon: <Ban className="size-4" />, tone: "muted" as const },
          { label: t("email.scheduled", "Scheduled"), value: stats.scheduled, icon: <Calendar className="size-4" />, tone: "info" as const },
        ].map((stat) => (
          <DashboardCard key={stat.label}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {stat.icon}
              {stat.label}
            </div>
            <div className="text-2xl font-semibold">{stat.value}</div>
          </DashboardCard>
        ))}
      </div>

      <DashboardCard>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t("email.searchRecipient", "Search recipient or subject...")}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <div className="sm:w-36">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
              >
                <option value="">{t("email.allStatus", "All Status")}</option>
                <option value="queued">{t("email.queued", "Queued")}</option>
                <option value="processing">{t("email.processing", "Processing")}</option>
                <option value="sent">{t("email.sent", "Sent")}</option>
                <option value="failed">{t("email.failed", "Failed")}</option>
                <option value="cancelled">{t("email.cancelled", "Cancelled")}</option>
              </select>
            </div>
            <div className="sm:w-36">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
              >
                <option value="">{t("email.allTypes", "All Types")}</option>
                <option value="verification">verification</option>
                <option value="reset_password">reset_password</option>
                <option value="payment_success">payment_success</option>
                <option value="welcome">welcome</option>
                <option value="credits_purchased">credits_purchased</option>
                <option value="subscription">subscription</option>
                <option value="affiliate_approval">affiliate_approval</option>
                <option value="announcement">announcement</option>
              </select>
            </div>
            <div className="sm:w-36">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                placeholder={t("email.from", "From")}
              />
            </div>
            <div className="sm:w-36">
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                placeholder={t("email.to", "To")}
              />
            </div>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-muted/30 border border-border">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} {t("email.selected", "selected")}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleRetry(Array.from(selectedIds))}>
              <RotateCcw className="mr-1 size-3" />
              {t("email.retrySelected", "Retry Selected")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleCancel(Array.from(selectedIds))}>
              <Ban className="mr-1 size-3" />
              {t("email.cancelSelected", "Cancel Selected")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteConfirmIds(Array.from(selectedIds))}>
              <Trash2 className="mr-1 size-3" />
              {t("email.deleteSelected", "Delete Selected")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <XCircle className="mr-1 size-3" />
              {t("email.clearSelection", "Clear")}
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={selectedIds.size === sortedItems.length && sortedItems.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.id", "ID")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("to")}>
                  <div className="flex items-center gap-1">{t("email.recipient", "Recipient")}<SortIcon field="to" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("subject")}>
                  <div className="flex items-center gap-1">{t("email.subject", "Subject")}<SortIcon field="subject" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("type")}>
                  <div className="flex items-center gap-1">{t("email.type", "Type")}<SortIcon field="type" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("priority")}>
                  <div className="flex items-center gap-1">{t("email.priority", "Priority")}<SortIcon field="priority" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("status")}>
                  <div className="flex items-center gap-1">{t("email.status", "Status")}<SortIcon field="status" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("attempts")}>
                  <div className="flex items-center gap-1">{t("email.attempts", "Attempts")}<SortIcon field="attempts" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-1">{t("email.created", "Created")}<SortIcon field="createdAt" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-border/50">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 w-20 bg-muted rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    <Mail className="size-8 mx-auto mb-2 opacity-50" />
                    {t("email.noQueueEntries", "No queue entries found")}
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{item.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 max-w-[180px] truncate">{item.to}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title={item.subject}>{item.subject}</td>
                      <td className="px-4 py-3 text-xs">{item.type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Badge tone="default">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.normal)}>
                            {item.priority}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[item.status] || "default"}>{item.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(item.attempts > 0 && item.status === "failed" && "text-destructive")}>
                          {item.attempts}/{item.maxAttempts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {item.status === "failed" && (
                            <Button variant="ghost" size="icon-xs" onClick={() => handleRetry([item.id])} title={t("email.retry", "Retry")}>
                              <RotateCcw className="size-3.5" />
                            </Button>
                          )}
                          {item.status !== "cancelled" && item.status !== "sent" && (
                            <Button variant="ghost" size="icon-xs" onClick={() => handleCancel([item.id])} title={t("email.cancel", "Cancel")}>
                              <XCircle className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr className="border-b border-border/50 bg-muted/10">
                        <td colSpan={10} className="px-4 py-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">{t("email.id", "ID")}:</span>
                                <span className="ml-2 font-mono text-xs">{item.id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.recipient", "Recipient")}:</span>
                                <span className="ml-2">{item.to}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.subject", "Subject")}:</span>
                                <span className="ml-2">{item.subject}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.type", "Type")}:</span>
                                <span className="ml-2">{item.type.replace(/_/g, " ")}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.category", "Category")}:</span>
                                <span className="ml-2">{item.category || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.provider", "Provider")}:</span>
                                <span className="ml-2">{item.providerName || "—"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.priority", "Priority")}:</span>
                                <span className="ml-2">{item.priority}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t("email.attempts", "Attempts")}:</span>
                                <span className="ml-2">{item.attempts} / {item.maxAttempts}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">{t("email.timeline", "Timeline")}:</span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1">
                                  <span className="size-2 rounded-full bg-blue-500" />
                                  {t("email.created", "Created")}: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                                </span>
                                {item.startedAt && (
                                  <>
                                    <span>→</span>
                                    <span className="flex items-center gap-1">
                                      <span className="size-2 rounded-full bg-yellow-500" />
                                      {t("email.started", "Started")}: {new Date(item.startedAt).toLocaleString()}
                                    </span>
                                  </>
                                )}
                                {item.completedAt && (
                                  <>
                                    <span>→</span>
                                    <span className="flex items-center gap-1">
                                      <span className={cn("size-2 rounded-full", item.status === "sent" ? "bg-green-500" : "bg-red-500")} />
                                      {t("email.completed", "Completed")}: {new Date(item.completedAt).toLocaleString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {item.scheduledAt && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">{t("email.scheduledAt", "Scheduled")}:</span>
                                <span className="ml-2">{new Date(item.scheduledAt).toLocaleString()}</span>
                              </div>
                            )}

                            {item.errorMessage && (
                              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                <span className="font-medium">{t("email.error", "Error")}:</span> {item.errorMessage}
                              </div>
                            )}

                            {item.smtpResponse && (
                              <div className="p-3 rounded-lg bg-muted/30 text-sm font-mono">
                                <span className="text-muted-foreground">{t("email.smtpResponse", "SMTP Response")}:</span>
                                <pre className="mt-1 whitespace-pre-wrap text-xs">{item.smtpResponse}</pre>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {item.status === "failed" && (
                                <Button variant="outline" size="sm" onClick={() => handleRetry([item.id])}>
                                  <RotateCcw className="mr-1 size-3" />
                                  {t("email.retry", "Retry")}
                                </Button>
                              )}
                              {(item.status === "queued" || item.status === "processing") && (
                                <Button variant="outline" size="sm" onClick={() => handleCancel([item.id])}>
                                  <Ban className="mr-1 size-3" />
                                  {t("email.cancel", "Cancel")}
                                </Button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {t("email.showing", "Showing")} {(page - 1) * limit + 1}–{Math.min(page * limit, total)} {t("email.of", "of")} {total}
              </p>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="h-8 rounded-lg border border-border bg-transparent px-2 text-sm"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("email.previous", "Previous")}
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                {t("email.next", "Next")}
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>

      {deleteConfirmIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirmIds(null)}>
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">{t("email.confirmDelete", "Delete Items")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("email.confirmDeleteDesc", "This will permanently delete")} {deleteConfirmIds.length} {t("email.items", "item(s)")}.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmIds(null)}>
                {t("admin.cancel", "Cancel")}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirmIds)}>
                <Trash2 className="mr-1 size-3" />
                {t("email.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
