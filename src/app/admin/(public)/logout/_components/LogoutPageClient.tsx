"use client";

import { useLocalizationContext } from "@/providers/localization";

export function LogoutPageClientContent() {
  const { t } = useLocalizationContext();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">{t("common.loading", "Signing out...")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.loggingOut", "Logging you out of the admin panel.")}</p>
        <form action="/api/auth/admin-logout" method="POST">
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
