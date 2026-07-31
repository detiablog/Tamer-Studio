"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  Filter,
  Clock,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type Transaction = {
  id: string;
  transactionNumber: string;
  gatewayTransactionId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  provider?: string;
  createdAt: string;
  paidAt?: string;
  description?: string;
  metadata?: Record<string, any>;
};

type PaymentStats = {
  revenueToday: number;
  revenueMonth: number;
  revenueYear: number;
  successfulPayments: number;
  failedPayments: number;
  refundRate: number;
  avgOrderValue: number;
  mrr: number;
};

const PAYMENT_STATUSES = [
  "all",
  "pending",
  "waiting_payment",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refund_requested",
  "refunded",
] as const;

const PAYMENT_METHODS = [
  "all",
  "qris",
  "va",
  "credit_card",
  "debit_card",
  "ewallet",
  "bank_transfer",
  "manual",
] as const;

const ITEMS_PER_PAGE = 15;

export function PaymentsPageClient() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [methodFilter, setMethodFilter] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [refundTarget, setRefundTarget] = React.useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = React.useState("");
  const [refundReason, setRefundReason] = React.useState("");
  const [processing, setProcessing] = React.useState(false);

  const queryParams = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    params.set("page", String(page));
    params.set("limit", String(ITEMS_PER_PAGE));
    return params.toString();
  }, [search, statusFilter, methodFilter, dateFrom, dateTo, page]);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/payments?${queryParams}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: statsData } = useSWR("/api/admin/payments/stats", fetcher, {
    revalidateOnFocus: false,
  });

  const transactions: Transaction[] = React.useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const totalCount: number = data?.total ?? transactions.length;

  const stats: PaymentStats = React.useMemo(() => {
    const s = statsData?.data || statsData;
    return {
      revenueToday: s?.revenueToday ?? 0,
      revenueMonth: s?.revenueMonth ?? 0,
      revenueYear: s?.revenueYear ?? 0,
      successfulPayments: s?.successfulPayments ?? 0,
      failedPayments: s?.failedPayments ?? 0,
      refundRate: s?.refundRate ?? 0,
      avgOrderValue: s?.avgOrderValue ?? 0,
      mrr: s?.mrr ?? 0,
    };
  }, [statsData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const formatCurrency = (amount: number, currency: string = "IDR") => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const statusTone = (status: string): "default" | "success" | "warning" | "info" | "muted" | "purple" => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
      case "waiting_payment":
        return "warning";
      case "failed":
      case "cancelled":
      case "expired":
        return "muted";
      case "refund_requested":
        return "info";
      case "refunded":
        return "purple";
      default:
        return "default";
    }
  };

  const handleRefund = async () => {
    if (!refundTarget) return;
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error(t("admin.error.missingFields"));
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/payments/${refundTarget.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(refundAmount),
          reason: refundReason,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Refund failed");
      toast.success(t("admin.refundPayment", "Refund processed"));
      setRefundTarget(null);
      setRefundAmount("");
      setRefundReason("");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async (tx: Transaction) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/payments/${tx.id}/verify`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Verification failed");
      toast.success(t("admin.verifyPayment", "Payment verified"));
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Transaction#", "User", "Method", "Status", "Amount", "Currency", "Date"];
    const rows = transactions.map((tx) => [
      tx.transactionNumber,
      tx.userName || tx.userEmail || tx.userId,
      tx.method,
      tx.status,
      String(tx.amount),
      tx.currency,
      tx.createdAt,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.exportSuccess", "Exported successfully"));
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[{ label: t("admin.payments", "Payments"), href: "/admin/payments" }]}
        />
        <PageHeader
          title={t("admin.payments", "Payments")}
          description={t("admin.paymentsDescription", "Manage payment transactions and billing")}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 size-4" />
                {t("common.export")}
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="size-4" />
              {t("admin.revenueToday", "Revenue Today")}
            </div>
            <div className="text-2xl font-semibold">{formatCurrency(stats.revenueToday)}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="size-4" />
              {t("admin.revenueThisMonth", "Revenue This Month")}
            </div>
            <div className="text-2xl font-semibold">{formatCurrency(stats.revenueMonth)}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckCircle className="size-4" />
              {t("admin.successfulPayments", "Successful Payments")}
            </div>
            <div className="text-2xl font-semibold">{stats.successfulPayments}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <XCircle className="size-4" />
              {t("admin.failedPayments", "Failed Payments")}
            </div>
            <div className="text-2xl font-semibold">{stats.failedPayments}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <RotateCcw className="size-4" />
              {t("admin.refundRate", "Refund Rate")}
            </div>
            <div className="text-2xl font-semibold">{stats.refundRate}%</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="size-4" />
              {t("admin.avgOrderValue", "Average Order Value")}
            </div>
            <div className="text-2xl font-semibold">{formatCurrency(stats.avgOrderValue)}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CreditCard className="size-4" />
              {t("admin.revenueThisYear", "Revenue This Year")}
            </div>
            <div className="text-2xl font-semibold">{formatCurrency(stats.revenueYear)}</div>
          </DashboardCard>
          <DashboardCard>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="size-4" />
              {t("admin.mrr", "Monthly Recurring Revenue")}
            </div>
            <div className="text-2xl font-semibold">{formatCurrency(stats.mrr)}</div>
          </DashboardCard>
        </div>

        <DashboardCard>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.search", "Search") + "..."}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("common.all")}</option>
                {PAYMENT_STATUSES.filter((s) => s !== "all").map((s) => (
                  <option key={s} value={s}>{t(`admin.paymentStatuses.${s}`, s)}</option>
                ))}
              </select>
              <select
                value={methodFilter}
                onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("common.all")}</option>
                {PAYMENT_METHODS.filter((m) => m !== "all").map((m) => (
                  <option key={m} value={m}>{t(`admin.paymentMethods.${m}`, m)}</option>
                ))}
              </select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-auto"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-auto"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="size-12 text-destructive mb-4" />
                <p className="text-foreground font-medium">{t("common.error")}</p>
                <Button variant="outline" className="mt-4" onClick={() => mutate()}>{t("common.retry")}</Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCard className="size-12 text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">{t("common.noData")}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.transactionNumber", "Transaction #")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.user", "User")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.paymentMethod", "Payment Method")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.paymentStatus", "Status")}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("admin.paymentAmount", "Amount")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.currency", "Currency")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.paymentDate", "Payment Date")}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <React.Fragment key={tx.id}>
                          <tr
                            className="border-b border-border hover:bg-muted/30 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                          >
                            <td className="py-3 px-2 font-medium">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{tx.transactionNumber}</code>
                            </td>
                            <td className="py-3 px-2">{tx.userName || tx.userEmail || tx.userId}</td>
                            <td className="py-3 px-2">{t(`admin.paymentMethods.${tx.method}`, tx.method)}</td>
                            <td className="py-3 px-2">
                              <Badge tone={statusTone(tx.status)}>{t(`admin.paymentStatuses.${tx.status}`, tx.status)}</Badge>
                            </td>
                            <td className="py-3 px-2 text-right font-medium">{formatCurrency(tx.amount, tx.currency)}</td>
                            <td className="py-3 px-2">{tx.currency}</td>
                            <td className="py-3 px-2">{formatDate(tx.createdAt)}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}>
                                  <Eye className="size-4" />
                                </Button>
                                {(tx.status === "paid" || tx.status === "waiting_payment") && (
                                  <Button variant="ghost" size="sm" onClick={() => handleVerify(tx)} disabled={processing}>
                                    <CheckCircle className="size-4" />
                                  </Button>
                                )}
                                {tx.status === "paid" && (
                                  <Button variant="ghost" size="sm" onClick={() => { setRefundTarget(tx); setRefundAmount(String(tx.amount)); }}>
                                    <RotateCcw className="size-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedRow === tx.id && (
                            <tr>
                              <td colSpan={8} className="p-0">
                                <div className="bg-muted/20 border-b border-border p-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground text-xs">{t("admin.transactionNumber", "Transaction #")}</p>
                                      <p className="font-medium">{tx.transactionNumber}</p>
                                    </div>
                                    {tx.gatewayTransactionId && (
                                      <div>
                                        <p className="text-muted-foreground text-xs">{t("admin.gatewayTransactionId", "Gateway ID")}</p>
                                        <p className="font-medium">{tx.gatewayTransactionId}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-muted-foreground text-xs">{t("admin.user", "User")}</p>
                                      <p className="font-medium">{tx.userName || tx.userEmail || tx.userId}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">{t("admin.paymentMethod", "Payment Method")}</p>
                                      <p className="font-medium">{t(`admin.paymentMethods.${tx.method}`, tx.method)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">{t("admin.paymentStatus", "Status")}</p>
                                      <Badge tone={statusTone(tx.status)}>{t(`admin.paymentStatuses.${tx.status}`, tx.status)}</Badge>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">{t("admin.paymentAmount", "Amount")}</p>
                                      <p className="font-medium">{formatCurrency(tx.amount, tx.currency)}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground text-xs">{t("admin.paymentDate", "Payment Date")}</p>
                                      <p className="font-medium">{formatDate(tx.createdAt)}</p>
                                    </div>
                                    {tx.paidAt && (
                                      <div>
                                        <p className="text-muted-foreground text-xs">{t("admin.paidAt", "Paid At")}</p>
                                        <p className="font-medium">{formatDate(tx.paidAt)}</p>
                                      </div>
                                    )}
                                    {tx.description && (
                                      <div className="col-span-2 sm:col-span-4">
                                        <p className="text-muted-foreground text-xs">{t("common.description")}</p>
                                        <p className="font-medium">{tx.description}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      {t("adminDataTable.showing", `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, totalCount)} of ${totalCount}`)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="size-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DashboardCard>
      </div>

      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-heading font-semibold">{t("admin.refundPayment", "Refund Payment")}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setRefundTarget(null); setRefundAmount(""); setRefundReason(""); }}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">{t("admin.transactionNumber", "Transaction #")}: <span className="font-medium text-foreground">{refundTarget.transactionNumber}</span></p>
                <p className="text-muted-foreground">{t("admin.paymentAmount", "Amount")}: <span className="font-medium text-foreground">{formatCurrency(refundTarget.amount, refundTarget.currency)}</span></p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.paymentAmount", "Amount")}</Label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={refundTarget.amount}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("common.description")}</Label>
                <Input
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder={t("common.description") + "..."}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <Button variant="outline" onClick={() => { setRefundTarget(null); setRefundAmount(""); setRefundReason(""); }}>{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={handleRefund} disabled={processing}>
                {processing && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("admin.refundPayment", "Refund Payment")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
