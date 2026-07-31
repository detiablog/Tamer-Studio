"use client";

import * as React from "react"
import useSWR from "swr"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { FileText, Star, Copy, Search } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  type: string;
  subject: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");

  const { data, error, isLoading } = useSWR("/api/admin/email/templates", fetcher);

  const templates: EmailTemplate[] = data?.data ?? [];

  const filtered = React.useMemo(() => {
    if (!search) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        tpl.type.toLowerCase().includes(q) ||
        tpl.key.toLowerCase().includes(q)
    );
  }, [templates, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("templates.pageTitle", "Templates")}</h2>
          <p className="text-sm text-muted-foreground">{t("templates.description", "Reusable prompt and production templates.")}</p>
        </div>
        <ActionButton>{t("templates.createTemplate", "Create Template")}</ActionButton>
      </div>
      <DashboardCard title={t("templates.templatesList", "Templates")} description={t("templates.templatesListDesc", "Quick-start templates for common workflows")}>
        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("templates.searchPlaceholder", "Search templates...")}
              aria-label={t("templates.searchAria")}
              className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <Button variant="outline" size="sm">{t("templates.filter", "Filter")}</Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("common.loading")}</p>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">{t("common.failedToLoad", "Failed to load data")}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search ? t("templates.noResults") : t("templates.empty")}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((template) => (
              <div key={template.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone="muted">{template.type}</Badge>
                      <span className="text-xs text-muted-foreground">{template.key}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge tone={template.isActive ? "success" : "muted"}>
                    {template.isActive ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                  </Badge>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Copy className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm">{t("templates.use", "Use")}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
