import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AIProviderDetail } from "@/features/ai/AIProviderDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `AI Provider — ${params.id} - Tamer Studio` };
}

export default function AIProviderDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <PageLayout title={"AI Provider"} breadcrumb={[{ label: "AI Platform", href: "/ai" }, { label: params.id }]}>
        <AIProviderDetail id={params.id} />
      </PageLayout>
    </AppShell>
  );
}
