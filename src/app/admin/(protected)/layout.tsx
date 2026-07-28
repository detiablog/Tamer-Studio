import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { getAdminSession } from "@/core/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <PageLayout>
        {children}
      </PageLayout>
    </AdminShell>
  );
}
