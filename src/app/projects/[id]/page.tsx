import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { ProjectDetail } from "@/components/project/ProjectDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Project — ${params.id} - Tamer Studio` };
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <PageLayout title={`Project`} breadcrumb={[{ label: "Projects", href: "/projects" }, { label: params.id }]}> 
        <ProjectDetail id={params.id} />
      </PageLayout>
    </AppShell>
  );
}
