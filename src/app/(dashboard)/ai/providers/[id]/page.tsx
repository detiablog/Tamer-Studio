import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { AIProviderDetail } from "@/features/ai/AIProviderDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `AI Provider — ${id} - Tamer Studio` };
}

export default function AIProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <AppShell>
        <PageLayout title="AI Provider" breadcrumb={[{ label: "AI Platform", href: "/ai" }, { label: id }]}>
          <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Provider detail coming soon.
          </div>
        </PageLayout>
    </AppShell>
  );
}
