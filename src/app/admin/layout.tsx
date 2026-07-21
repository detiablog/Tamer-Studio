import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { requireAdmin } from "@/core/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
    
    return (
      <AdminShell>
        <PageLayout title="Admin" breadcrumb={[{ label: "Admin" }]}>
          {children}
        </PageLayout>
      </AdminShell>
    );
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
}
