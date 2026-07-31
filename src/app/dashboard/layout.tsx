import { AppShell } from "@/components/ui/AppShell";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
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
      <DashboardShell>{children}</DashboardShell>
    </AppShell>
  );
}
