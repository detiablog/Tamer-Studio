import { clearAdminSessionCookie, getAdminSession } from "@/core/admin/session";
import { logoutAdmin } from "@/core/admin/logout";
import { redirect } from "next/navigation";

async function logoutAdminAction() {
  "use server";

  const session = await getAdminSession();

  if (session) {
    await logoutAdmin(session.id);
    await clearAdminSessionCookie();
  }

  redirect("/admin/login");
}

export default async function AdminLogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Signing out...</h1>
        <p className="text-sm text-muted-foreground">Logging you out of the admin panel.</p>
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Confirm Logout
          </button>
        </form>
      </div>
    </div>
  );
}
