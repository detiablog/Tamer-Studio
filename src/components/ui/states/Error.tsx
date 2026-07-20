import * as React from "react"

export function ErrorState({ message = "An error occurred" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-sm text-destructive">{message}</div>
    </div>
  )
}
