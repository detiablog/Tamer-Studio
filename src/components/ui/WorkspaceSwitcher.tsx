import * as React from "react"

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
    <div className="relative hidden sm:flex items-center gap-2">
      <button onClick={() => setOpen((v) => !v)} className="rounded-md px-3 py-1 text-sm hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50">
        {current}
      </button>
      {open ? (
        <div className="absolute left-0 mt-2 w-56 rounded-lg bg-card p-2 shadow-lg ring-1 ring-foreground/8">
          {list.length ? list.map((s) => (
            <button key={s.id} onClick={() => { workspaceStore.setCurrentId(s.id); setCurrent(s.name); setOpen(false) }} className="block w-full text-left rounded-md px-3 py-2 hover:bg-muted/30">{s.name}</button>
          )) : SAMPLE.map((s) => (
            <button key={s} onClick={() => { setCurrent(s); setOpen(false) }} className="block w-full text-left rounded-md px-3 py-2 hover:bg-muted/30">{s}</button>
          ))}
          <div className="border-t mt-2 pt-2">
            <a href="/workspace" className="block text-sm text-muted-foreground rounded-md px-3 py-2 hover:bg-muted/30">Manage workspaces</a>
          </div>
        </div>
      ) : null}
    </div>
  )
}
