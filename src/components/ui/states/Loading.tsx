import * as React from "react"

export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-sm text-muted-foreground">{message}</div>
    </div>
  )
}
