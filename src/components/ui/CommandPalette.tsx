"use client"

import * as React from "react"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const commands = React.useMemo(
    () => [
      { id: "dashboard", title: "Go to Dashboard", href: "/dashboard" },
      { id: "workspace", title: "Open Workspace", href: "/workspace" },
      { id: "projects", title: "Open Projects", href: "/projects" },
      { id: "media", title: "Open Media Library", href: "/media" },
      { id: "production", title: "Open Production", href: "/production" },
      { id: "publishing", title: "Open Publishing", href: "/publishing" },
      { id: "settings", title: "Open Settings", href: "/settings" },
    ],
    []
  )

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const results = commands.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24">
      <div className="w-full max-w-2xl rounded-2xl bg-card p-4 shadow-lg ring-1 ring-foreground/8">
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search commands or pages..." className="w-full bg-transparent pb-2 text-sm outline-none" />
        <div className="mt-2 max-h-64 overflow-auto">
          {results.map((r) => (
                              <div key={r.id} onClick={() => { setOpen(false); window.location.href = r.href }} className="cursor-pointer rounded-md px-3 py-2 hover:bg-muted/40">{r.title}</div>
          ))}
          {results.length === 0 ? <div className="text-sm text-muted-foreground px-3 py-2">No results</div> : null}
        </div>
      </div>
    </div>
  )
}
