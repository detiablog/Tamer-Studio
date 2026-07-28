import * as React from "react"
import { Button } from "./button"

export function ActionButton({ children, variant = "default", onClick, disabled }: { children: React.ReactNode; variant?: React.ComponentProps<typeof Button>['variant']; onClick?: () => void; disabled?: boolean }) {
  return (
    <Button variant={variant} onClick={onClick} disabled={disabled} className="ml-2">
      {children}
    </Button>
  )
}
