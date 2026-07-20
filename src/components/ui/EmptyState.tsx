import * as React from "react"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
      {icon && <div className="mb-3 text-muted-foreground/60">{icon}</div>}
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      {description ? <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p> : null}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
