"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function LoginPageClientContent({ csrfToken, error }: { csrfToken: string; error?: string }) {
  const { t } = useLocalizationContext();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-primary/5 to-transparent rounded-full blur-3xl -z-10" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl -z-10" aria-hidden="true" />

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl" role="banner">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label={t("admin.login.backToHome", "Back to Home")}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <span className="text-xs font-bold">TS</span>
              </div>
              <span className="hidden sm:inline text-sm font-semibold">Tamer Studio</span>
            </a>

            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label={t("topbar.toggleTheme", "Toggle theme")}
                >
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 pt-24" role="main">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-xl ring-1 ring-primary/5">
            <AdminLoginForm error={error as any} csrfToken={csrfToken} />
          </div>

          <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-200 text-center" role="note">
            {t("admin.login.restrictedAccess", "This is a restricted access area. Unauthorized access attempts are logged.")}
          </div>
        </div>
      </main>
    </div>
  );
}
