import * as React from "react"

export function PageHeader({ title, description, actions }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h1 className="font-heading text-2xl font-semibold leading-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">{actions}</div> : null}
    </div>
  )
}
