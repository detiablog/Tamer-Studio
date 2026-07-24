"use client";

import * as React from "react";
import { Sun, Moon, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { AdminAvatarDropdown } from "@/components/admin/AdminAvatarDropdown";
import { useTheme } from "next-themes";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationCenter } from "@/components/ui/NotificationCenter";

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme()
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Only render theme toggle after hydration
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="relative flex items-center gap-4 border-b py-3 px-4">
      <CommandPalette />

      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/40" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/30 font-heading text-sm">TS</div>
        <div className="font-heading text-sm font-semibold">Tamer Studio</div>
      </div>

      <div className="ml-4 flex flex-1 items-center">
        <div className="flex-1">
          <SearchInput placeholder="Search projects, media, actions..." />
        </div>
      </div>

      <div className="flex items-center gap-2">
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
  )
}
