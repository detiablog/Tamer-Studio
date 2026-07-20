import * as React from "react"
import { Button } from "./button"

export function ActionButton({ children, variant = "default", onClick }: { children: React.ReactNode; variant?: React.ComponentProps<typeof Button>['variant']; onClick?: () => void }) {
  return (
    <Button variant={variant} onClick={onClick} className="ml-2">
      {children}
    </Button>
  )
}
