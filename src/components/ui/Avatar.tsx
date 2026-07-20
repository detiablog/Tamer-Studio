import * as React from "react"

export function Avatar({ name = "U", size = 32 }: { name?: string; size?: number }) {
  return (
    <div className="rounded-full bg-muted/30 flex h-8 w-8 items-center justify-center text-sm font-medium" style={{ width: size, height: size }}>
      {name[0]}
    </div>
  )
}
