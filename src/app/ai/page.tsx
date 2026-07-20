import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AIPlatformDashboard } from "@/features/ai/AIPlatformDashboard";

export const metadata = {
  title: "AI Platform - Tamer Studio",
  description: "Manage AI providers, models, prompts, and usage for the Tamer Studio platform.",
};

export default function AIPlatformPage() {
  return (
    <AppShell>
      <PageLayout
        title={"AI Platform"}
        description={"An extensible platform to connect providers, manage models, and compose prompts."}
        breadcrumb={[{ label: "AI Platform" }]}
      >
        <AIPlatformDashboard />
      </PageLayout>
    </AppShell>
  );
}
