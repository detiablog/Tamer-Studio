import { clearAdminSessionCookie } from "@/core/admin/session";
import { logoutAdminByToken } from "@/core/admin/logout";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LogoutPageClientContent } from "./_components/LogoutPageClient";

async function logoutAdminAction() {
  "use server";

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (sessionToken) {
    await logoutAdminByToken(sessionToken);
    await clearAdminSessionCookie();
  }

  redirect("/admin/login");
}

export const dynamic = "force-dynamic";

export default async function AdminLogoutPage() {
  return <LogoutPageClientContent />;
}
