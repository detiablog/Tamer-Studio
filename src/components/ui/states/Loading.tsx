import * as React from "react"
import { Loader2 } from "lucide-react"

export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}
