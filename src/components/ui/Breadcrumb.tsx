import * as React from "react"
import Link from "next/link"

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      {items.map((it, idx) => (
        <span key={idx}>
                {it.href ? (
                  <Link href={it.href as Parameters<typeof Link>[0]["href"]} className="text-muted-foreground hover:text-foreground">
                    {it.label}
                  </Link>
                ) : (
                  <span>{it.label}</span>
                )}
                {idx < items.length - 1 ? <span className="mx-2">/</span> : null}
              </span>
            ))}
    </nav>
  )
}
