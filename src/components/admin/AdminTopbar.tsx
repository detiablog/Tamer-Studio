"use client";

import * as React from "react";
import { Sun, Moon, Bell, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { AdminAvatarDropdown } from "@/components/admin/AdminAvatarDropdown";
import { useTheme } from "next-themes";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
];

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocalizationContext();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    if (langOpen) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [langOpen]);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const routes: Record<string, string> = {
      users: "/admin/users",
      organizations: "/admin/organizations",
      workspaces: "/admin/workspaces",
      jobs: "/admin/jobs",
      queues: "/admin/queues",
      coupons: "/admin/coupons",
      billing: "/admin/billing",
      settings: "/admin/settings",
      analytics: "/admin/analytics",
      flags: "/admin/feature-flags",
      providers: "/admin/ai-providers",
      keys: "/admin/api-keys",
      logs: "/admin/audit-logs",
      profile: "/admin/profile",
      subscriptions: "/admin/subscriptions",
    };
    const matchedRoute = Object.entries(routes).find(([key]) => q.includes(key));
    if (matchedRoute) {
      window.location.href = matchedRoute[1];
    } else {
      toast.info(t("common.noResults", `No results found for "${query}"`));
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <header className="relative flex items-center gap-4 border-b py-3 px-4">
      <CommandPalette />

      {onMenuClick && (
        <button onClick={onMenuClick} className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/40" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      )}

      <div className="flex-1">
        <SearchInput placeholder={t("admin.search", "Search users, organizations, jobs, queues...")} onSearch={handleSearch} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="rounded-lg px-2 py-1 text-sm hover:bg-muted/40 flex items-center gap-1"
            aria-label="Change language"
            aria-expanded={langOpen}
            aria-haspopup="true"
          >
            <Globe className="size-5" />
            <span className="hidden md:inline text-xs">{currentLang.flag}</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} aria-hidden="true" />
              <div
                className="absolute right-0 z-50 w-48 rounded-xl bg-card p-1.5 shadow-lg ring-1 ring-foreground/10 animate-in fade-in slide-in-from-top-2 duration-200"
                role="menu"
                aria-orientation="vertical"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    role="menuitem"
                    onClick={() => {
                      setLocale(lang.code as "en" | "id");
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/40 ${
                      locale === lang.code ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="flex-1 text-left">{lang.label}</span>
                    {locale === lang.code && (
                      <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setNotifOpen((v) => !v)} className="rounded-lg px-2 py-1 text-sm hover:bg-muted/40" aria-label="Notifications">
            <Bell className="size-5" />
          </button>
          <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {mounted ? (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        ) : (
          <Button variant="outline" size="icon" disabled aria-label="Toggle theme">
            <Sun className="size-4" />
          </Button>
        )}

        <AdminAvatarDropdown />
      </div>
    </header>
  );
}
