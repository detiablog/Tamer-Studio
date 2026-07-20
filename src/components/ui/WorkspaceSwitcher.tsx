import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const SAMPLE = ["Personal", "Acme Studio", "Marketing Team"]

import { workspaceStore } from "@/features/workspace/workspace.store"

export function WorkspaceSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [current, setCurrent] = React.useState(() => {
    try {
      const id = workspaceStore.getCurrentId();
      if (id) {
        const w = workspaceStore.get(id);
        if (w) return w.name;
      }
      const list = workspaceStore.getAll();
      if (list.length) return list[0].name;
      return SAMPLE[0];
    } catch (e) { void e; return SAMPLE[0]; }
  })

  React.useEffect(() => {
    try { localStorage.setItem("tamer:workspace", current) } catch (e) { void e; }
  }, [current])

  const list = (() => { try { return workspaceStore.getAll(); } catch (e) { void e; return [] } })()

  return (
    <div className="relative hidden sm:flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200",
          "hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50",
          open && "bg-muted/40"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="max-w-[120px] truncate">{current}</span>
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute left-0 z-50 w-56 rounded-xl bg-card p-1.5 shadow-lg ring-1 ring-foreground/10 animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
          >
            {list.length ? list.map((s) => (
              <button
                key={s.id}
                onClick={() => { workspaceStore.setCurrentId(s.id); setCurrent(s.name); setOpen(false) }}
                className={cn(
                  "block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                  s.name === current ? "bg-muted/60 font-medium" : "hover:bg-muted/40"
                )}
                role="menuitem"
              >
                {s.name}
              </button>
            )) : SAMPLE.map((s) => (
              <button
                key={s}
                onClick={() => { setCurrent(s); setOpen(false) }}
                className={cn(
                  "block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors",
                  s === current ? "bg-muted/60 font-medium" : "hover:bg-muted/40"
                )}
                role="menuitem"
              >
                {s}
              </button>
            ))}
            <div className="my-1 h-px bg-border/60" />
            <a
              href="/workspace"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
              role="menuitem"
            >
              <Plus className="size-3.5" />
              <span>Manage workspaces</span>
            </a>
          </div>
        </>
      )}
    </div>
  )
}
