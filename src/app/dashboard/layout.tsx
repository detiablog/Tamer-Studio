import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { requireUser } from "@/core/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireUser();
  } catch {
    redirect("/login");
  }

  return (
    <AppShell>
      <PageLayout title="Dashboard" breadcrumb={[{ label: "Dashboard" }]}>
        {children}
      </PageLayout>
    </AppShell>
  );
}
