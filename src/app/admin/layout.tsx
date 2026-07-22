import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { requireAdmin } from "@/core/admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <PageLayout title="Admin" breadcrumb={[{ label: "Admin" }]}>
        {children}
      </PageLayout>
    </AdminShell>
  );
}
