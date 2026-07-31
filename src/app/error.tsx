"use client";

import * as React from "react";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { ErrorState } from "@/components/ui/states/Error";
import { ActionButton } from "@/components/ui/ActionButton";
import { useLocalizationContext } from "@/providers/localization";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  const { t } = useLocalizationContext();
  const message = error?.message || String(error) || t("error.unexpected", "An unexpected error occurred");

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto w-full max-w-4xl">
        <PageLayout
          title={t("error.title", "Something went wrong")}
          description={t("error.description", "An unexpected error occurred. Refresh the page or return home to continue.")}
          actions={
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => reset?.()}>{t("error.tryAgain", "Try again")}</ActionButton>
              <Link href="/" className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                {t("notFound.goHome", "Go home")}
              </Link>
            </div>
          }
        >
          <ErrorState message={message} />
        </PageLayout>
      </div>
    </main>
  );
}
