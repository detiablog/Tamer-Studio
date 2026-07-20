import * as React from "react"

export function SearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
  return (
    <div className="relative w-full max-w-lg">
      <input aria-label="Global search" placeholder={placeholder} className="w-full rounded-lg border bg-background/30 px-3 py-2 text-sm placeholder:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
    </div>
  )
}
