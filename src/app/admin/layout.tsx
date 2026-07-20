import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <PageLayout title="Admin" breadcrumb={[{ label: "Admin" }]}>
        {children}
      </PageLayout>
    </AdminShell>
  );
}
