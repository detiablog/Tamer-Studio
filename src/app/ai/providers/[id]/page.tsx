import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AIProviderDetail } from "@/features/ai/AIProviderDetail";

export const metadata = {
  title: "AI Provider Details - Tamer Studio",
  description: "View provider configuration, models, and credentials for your AI providers.",
};

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <PageLayout
        title={"Provider detail"}
        description={"Review connection status, credentials, and model options for this provider."}
        breadcrumb={[{ label: "AI Platform", href: "/ai" }, { label: "Provider" }]}
      >
        <AIProviderDetail id={params.id} />
      </PageLayout>
    </AppShell>
  );
}
