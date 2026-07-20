import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { requireAuth } from "@/lib/auth/server-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAuth();
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <AppShell>
      <PageLayout title="Dashboard" breadcrumb={[{ label: "Dashboard" }]}>
        {children}
      </PageLayout>
    </AppShell>
  );
}
