"use client"

import * as React from "react"

export function NotificationCenter({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-card p-3 shadow-lg ring-1 ring-foreground/8">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">Notifications</div>
        <button onClick={onClose} className="text-sm text-muted-foreground">Close</button>
      </div>
      <div className="space-y-2 max-h-60 overflow-auto">
        <div className="rounded-md border p-3">No notifications (UI only)</div>
      </div>
    </div>
  )
}
