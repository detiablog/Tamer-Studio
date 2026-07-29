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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-destructive/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-destructive/5 to-transparent rounded-full blur-3xl -z-10" />

      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 transition hover:opacity-80"
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

      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-xl ring-1 ring-destructive/10">
            <AdminLoginForm error={error as any} csrfToken={csrfToken} />
          </div>

          <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-200 text-center">
            ⚠️ {t("admin.login.restrictedAccess")}
          </div>
        </div>
      </div>
    </div>
  );
}
