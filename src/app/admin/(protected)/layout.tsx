import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // In development, skip session validation
  // In production, implement proper session checking

  return (
    <AdminShell>
      <PageLayout>
        {children}
      </PageLayout>
    </AdminShell>
  );
}
