"use client";

import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { useLocalizationContext } from "@/providers/localization";

export function NotFoundContent() {
  const { t } = useLocalizationContext();

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <PageLayout
          title={t("notFound.title", "Page not found")}
          description={t("notFound.description", "We couldn't find the page you're looking for.")}
          actions={
            <Link href="/" className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
              {t("notFound.goHome", "Go home")}
            </Link>
          }
        >
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold">404</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("notFound.pageDoesNotExist", "The requested page does not exist.")}</p>
          </div>
        </PageLayout>
      </div>
    </main>
  );
}
