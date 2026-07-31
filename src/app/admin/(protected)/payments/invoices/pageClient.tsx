"use client";

import * as React from "react";
import useSWR from "swr";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Download,
  Mail,
  AlertTriangle,
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

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerEmail?: string;
  userId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
};

const INVOICE_STATUSES = ["all", "paid", "pending", "overdue", "cancelled", "draft"] as const;

const ITEMS_PER_PAGE = 15;

export function InvoicesPageClient() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const queryParams = React.useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    params.set("page", String(page));
    params.set("limit", String(ITEMS_PER_PAGE));
    return params.toString();
  }, [search, statusFilter, dateFrom, dateTo, page]);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/invoices?${queryParams}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const invoices: Invoice[] = React.useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const totalCount: number = data?.total ?? invoices.length;
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
        return "warning";
      case "overdue":
        return "muted";
      case "cancelled":
        return "muted";
      case "draft":
        return "info";
      default:
        return "default";
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleEmail = async (invoice: Invoice) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/email`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send email");
      toast.success(t("admin.emailInvoice", "Invoice emailed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("admin.payments", "Payments"), href: "/admin/payments" },
            { label: t("admin.invoices", "Invoices"), href: "/admin/payments/invoices" },
          ]}
        />
        <PageHeader
          title={t("admin.invoices", "Invoices")}
          description={t("admin.invoicesDescription", "View and manage invoices")}
        />

        <DashboardCard>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.searchInvoices", "Search invoices...")}
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
                {INVOICE_STATUSES.filter((s) => s !== "all").map((s) => (
                  <option key={s} value={s}>{s}</option>
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
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="size-12 text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">{t("common.noData")}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.invoiceNumber", "Invoice #")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.customer", "Customer")}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("admin.invoiceTotal", "Total")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.paymentStatus", "Status")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.invoiceDate", "Invoice Date")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.dueDate", "Due Date")}</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-3 px-2 font-medium">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{invoice.invoiceNumber}</code>
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium">{invoice.customerName || invoice.customerEmail || "—"}</p>
                              {invoice.customerEmail && invoice.customerName && (
                                <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(invoice.amount, invoice.currency)}</td>
                          <td className="py-3 px-2">
                            <Badge tone={statusTone(invoice.status)}>{invoice.status}</Badge>
                          </td>
                          <td className="py-3 px-2">{formatDate(invoice.createdAt)}</td>
                          <td className="py-3 px-2">{formatDate(invoice.dueDate || "")}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toast.info(t("common.view") + ": " + invoice.invoiceNumber)}>
                                <Eye className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice)}>
                                <Download className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEmail(invoice)}>
                                <Mail className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
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
    </PageContainer>
  );
}
