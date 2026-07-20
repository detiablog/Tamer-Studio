import * as React from "react"

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      {items.map((it, idx) => (
        <span key={idx}>
                {it.href ? (
                  <a href={it.href} className="text-muted-foreground hover:text-foreground">
                    {it.label}
                  </a>
                ) : (
                  <span>{it.label}</span>
                )}
                {idx < items.length - 1 ? <span className="mx-2">/</span> : null}
              </span>
            ))}
    </nav>
  )
}
