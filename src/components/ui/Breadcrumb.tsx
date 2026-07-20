import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {it.href ? (
              <Link
                href={it.href as Parameters<typeof Link>[0]["href"]}
                className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
              >
                {it.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current="page">{it.label}</span>
            )}
            {idx < items.length - 1 ? (
              <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
