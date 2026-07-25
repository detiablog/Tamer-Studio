import { cookies } from "next/headers";
import { clearAdminSessionCookie } from "@/core/admin/session";
import { logoutAdminByToken } from "@/core/admin/logout";
import { redirect } from "next/navigation";
import { getLocalizationService } from "@/lib/localization";

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
  const t = getLocalizationService().t;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">{t("common.loading", "Signing out...")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.loggingOut", "Logging you out of the admin panel.")}</p>
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            {t("common.confirm", "Confirm Logout")}
          </button>
        </form>
      </div>
    </div>
  );
}
