"use client"

import * as React from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalizationContext } from "@/providers/localization"

type CommandItem = {
  id: string
  title: string
  href: string
  category?: string
  shortcut?: string[]
}

export function CommandPalette() {
  const { t } = useLocalizationContext()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const COMMANDS: CommandItem[] = [
    { id: "dashboard", title: t("commandPalette.goToDashboard"), href: "/dashboard", category: t("commandPalette.navigation"), shortcut: ["⌘", "D"] },
    { id: "workspace", title: t("commandPalette.openWorkspace"), href: "/workspace", category: t("commandPalette.navigation"), shortcut: ["⌘", "W"] },
    { id: "projects", title: t("commandPalette.openProjects"), href: "/projects", category: t("commandPalette.navigation"), shortcut: ["⌘", "P"] },
    { id: "media", title: t("commandPalette.openMediaLibrary"), href: "/media", category: t("commandPalette.navigation"), shortcut: ["⌘", "M"] },
    { id: "production", title: t("commandPalette.openProduction"), href: "/production", category: t("commandPalette.navigation"), shortcut: ["⌘", "R"] },
    { id: "ai", title: t("commandPalette.openAIPlatform"), href: "/ai", category: t("commandPalette.navigation"), shortcut: ["⌘", "A"] },
    { id: "publishing", title: t("commandPalette.openPublishing"), href: "/publishing", category: t("commandPalette.navigation"), shortcut: ["⌘", "U"] },
    { id: "settings", title: t("commandPalette.openSettings"), href: "/settings", category: t("commandPalette.navigation"), shortcut: ["⌘", "S"] },
  ]

  const results = React.useMemo(() => {
    if (!query.trim()) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter((c) => c.title.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
  }, [query])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
        setQuery("")
        setSelectedIndex(0)
      }
      if (e.key === "Escape") {
        setOpen(false)
        setQuery("")
      }
      if (e.key === "ArrowDown" && open) {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === "ArrowUp" && open) {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === "Enter" && open && results[selectedIndex]) {
        e.preventDefault()
        window.location.href = results[selectedIndex].href
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, results, selectedIndex])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  const grouped = results.reduce<Record<string, CommandItem[]>>((acc, item) => {
    const cat = item.category ?? t("commandPalette.other")
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24">
      <div
        className="w-full max-w-2xl rounded-2xl bg-card p-1 shadow-2xl ring-1 ring-foreground/10"
        role="dialog"
        aria-modal="true"
        aria-label={t("commandPalette.ariaLabel")}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("commandPalette.placeholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            aria-label={t("commandPalette.searchAria")}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 border border-border/60 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto border-t border-border/60 px-2 py-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-2">
              <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {category}
              </div>
              {items.map((item) => {
                const globalIndex = results.indexOf(item)
                return (
                  <Link
                    key={item.id}
                    href={item.href as Parameters<typeof Link>[0]["href"]}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                      globalIndex === selectedIndex
                        ? "bg-muted/60 text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <span>{item.title}</span>
                    {item.shortcut ? (
                      <span className="flex items-center gap-0.5">
                        {item.shortcut.map((k) => (
                          <kbd key={k} className="text-[10px] text-muted-foreground/70 border border-border/60 rounded px-1 py-0.5">{k}</kbd>
                        ))}
                      </span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          ))}
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("commandPalette.noResults", `No results found for "${query}"`)}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground/70">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="border border-border/60 rounded px-1 py-0.5">↑↓</kbd> {t("commandPalette.navigate")}</span>
            <span className="flex items-center gap-1"><kbd className="border border-border/60 rounded px-1 py-0.5">↵</kbd> {t("commandPalette.select")}</span>
            <span className="flex items-center gap-1"><kbd className="border border-border/60 rounded px-1 py-0.5">ESC</kbd> {t("commandPalette.close")}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
