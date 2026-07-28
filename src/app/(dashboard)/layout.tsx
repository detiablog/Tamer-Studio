import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { getServerSession } from "@/core/auth/session";
import { getTranslation } from "@/lib/localization/translations";
import { hasActiveAccess } from "@/core/commerce";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const workspaceId = cookieStore.get("tamer_workspace_id")?.value;

  if (workspaceId) {
    const active = await hasActiveAccess(workspaceId);
    if (!active) {
      redirect("/pricing");
    }
  }

  const t = (key: string, fallback?: string) => getTranslation(locale, key, fallback);

  return (
    <AppShell>
      <PageLayout title={t("dashboard.title", "Dashboard")} breadcrumb={[{ label: t("dashboard.title", "Dashboard") }]}>
        {children}
      </PageLayout>
    </AppShell>
  );
}
