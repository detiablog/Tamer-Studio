"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, CreditCard, Receipt, Loader } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

export default function BillingPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [activeTab, setActiveTab] = React.useState("invoices");
  const [search, setSearch] = React.useState("");

  const { data, error, isLoading, mutate } = useSWR("/api/admin/billing", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const invoices = React.useMemo(() => {
    if (data?.success) {
      if (Array.isArray(data.data)) return data.data;
      if (data.data?.data && Array.isArray(data.data.data)) return data.data.data;
    }
    return [];
  }, [data]);

  const filteredInvoices = React.useMemo(
    () => invoices.filter((i: any) => i.invoiceNo?.toLowerCase().includes(search.toLowerCase()) || i.workspace?.toLowerCase().includes(search.toLowerCase())),
    [invoices, search]
  );

  const handleExportCSV = () => {
    const headers = activeTab === "invoices"
      ? `${t("admin.billing.invoiceNo")},${t("admin.billing.workspace")},${t("common.amount")},${t("common.date")},${t("common.status")},${t("admin.billing.dueDate")}\n`
      : `${t("admin.billing.paymentMethod")},${t("common.amount")},${t("common.date")},${t("common.status")}\n`;
    const rows = (activeTab === "invoices" ? filteredInvoices : invoices).map((item: any) =>
      activeTab === "invoices"
        ? `${item.invoiceNo},${item.workspace},${formatCurrency(item.amount)},${item.date},${item.status},${item.dueDate}`
        : `${item.method},${formatCurrency(item.amount)},${item.date},${item.status}`
    ).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `billing-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.billing.exportSuccess", "Billing data exported"));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.billing", "Billing") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.billing", "Billing")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.billing.description", "Manage invoices, payments, and subscriptions")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.billing", "Billing") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.billing", "Billing")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.billing.description", "Manage invoices, payments, and subscriptions")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message || t("admin.billing.loadError", "Could not load billing data")}</p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.billing", "Billing") }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.billing", "Billing")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.billing.description", "Manage invoices, payments, and subscriptions")}</p>
        </div>

        <div className="flex items-center gap-2 pb-4 border-b border-border mb-4">
          <Button variant={activeTab === "invoices" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("invoices")}>{t("admin.billing.tabInvoices", "Invoices")}</Button>
          <Button variant={activeTab === "payments" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("payments")}>{t("admin.billing.paymentHistory", "Payment History")}</Button>
          <Button variant={activeTab === "subscriptions" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("subscriptions")}>{t("admin.subscriptions", "Subscriptions")}</Button>
        </div>

        {activeTab === "invoices" && (
          <>
            <div className="flex items-center gap-2 pb-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.billing.searchInvoices", "Search invoices...")} className="pl-9" />
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV}><Receipt className="mr-2 size-4" />{t("common.export", "Export")}</Button>
            </div>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {t("admin.billing.noInvoices", "No invoices found")}
              </div>
            ) : (
              <AdminDataTable
                data={filteredInvoices}
                keyExtractor={(i) => i.id}
                columns={[
                  { key: "invoiceNo", header: t("admin.billing.invoiceNo", "Invoice #"), render: (i: any) => <span className="font-medium text-sm">{i.invoiceNo}</span> },
                  { key: "workspace", header: t("admin.billing.workspace", "Workspace"), render: (i: any) => <span className="text-sm">{i.workspace}</span> },
                  { key: "amount", header: t("common.amount", "Amount"), render: (i: any) => <span className="font-medium text-sm">{formatCurrency(i.amount)}</span> },
                  { key: "date", header: t("common.date", "Date"), render: (i: any) => <span className="text-sm">{i.date}</span> },
                  { key: "status", header: t("common.status", "Status"), render: (i: any) => <Badge tone={i.status === "Paid" ? "success" : i.status === "Pending" ? "warning" : "muted"}>{i.status}</Badge> },
                  { key: "dueDate", header: t("admin.billing.dueDate", "Due Date"), render: (i: any) => <span className="text-sm text-muted-foreground">{i.dueDate}</span> },
                  { key: "actions", header: "", align: "right", render: (i: any) => (
                    <Button variant="ghost" size="icon-xs" onClick={() => { const blob = new Blob([`Invoice ${i.invoiceNo}\nWorkspace: ${i.workspace}\nAmount: ${formatCurrency(i.amount)}\nDate: ${i.date}\nStatus: ${i.status}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${i.invoiceNo}.txt`; link.click(); URL.revokeObjectURL(url); toast.success(t("admin.billing.toastInvoiceExported", "Invoice exported")); }} aria-label={t("admin.billing.exportInvoice", "Export invoice")}><Receipt className="size-3.5" /></Button>
                  )},
                ]}
              />
            )}
          </>
        )}

        {activeTab === "payments" && (
          invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t("admin.billing.noPayments", "No payment records found")}
            </div>
          ) : (
            <AdminDataTable
              data={invoices.filter((i: any) => i.method)}
              keyExtractor={(p) => p.id}
              columns={[
                { key: "method", header: t("admin.billing.paymentMethod", "Method"), render: (p: any) => <span className="text-sm">{p.method} {p.last4 ? `****${p.last4}` : ""}</span> },
                { key: "amount", header: t("common.amount", "Amount"), render: (p: any) => <span className="font-medium text-sm">{formatCurrency(p.amount)}</span> },
                { key: "date", header: t("common.date", "Date"), render: (p: any) => <span className="text-sm">{p.date}</span> },
                { key: "status", header: t("common.status", "Status"), render: (p: any) => <Badge tone={p.status === "Completed" ? "success" : "warning"}>{p.status}</Badge> },
              ]}
            />
          )
        )}

        {activeTab === "subscriptions" && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="size-8 mx-auto mb-2 opacity-40" />
            <p>{t("admin.billing.noSubscriptions", "No active subscriptions found")}</p>
            <Button variant="link" className="mt-2">{t("admin.billing.viewPlans", "View plans")}</Button>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
