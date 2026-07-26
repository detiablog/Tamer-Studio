import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { AIPageClient } from "./AIPageClient"
import { AIPageActions } from "./AIPageActions"

export default function AIPage() {
  return (
    <AppShell>
      <PageLayout title="AI Platform" description="Configure AI providers, models, and prompts." breadcrumb={[{ label: "AI Platform" }]} actions={<AIPageActions />}>
        <AIPageClient />
      </PageLayout>
    </AppShell>
  );
}
