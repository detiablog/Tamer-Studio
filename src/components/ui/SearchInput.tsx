"use client";

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchInput({ placeholder = "Search...", onSearch }: { placeholder?: string; onSearch?: (query: string) => void }) {
  const [value, setValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<Array<{ type: string; id?: string; label: string; description?: string; href: string }>>([])
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null!)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        window.location.href = suggestions[selectedIndex].href
      } else if (onSearch && value.trim()) {
        onSearch(value)
      }
    } else if (e.key === "Escape") {
      setIsFocused(false)
      setSuggestions([])
      inputRef.current?.blur()
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setValue(query)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        setSuggestions(data.results || [])
        setSelectedIndex(0)
      } catch {
        // silent fail for search
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleSuggestionClick = (href: string) => {
    setSuggestions([])
    setValue("")
    window.location.href = href
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className={cn("relative w-full max-w-lg transition-all duration-200", isFocused && suggestions.length > 0 ? "max-w-xl" : isFocused ? "max-w-xl" : "max-w-lg")}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        ref={inputRef}
        aria-label="Global search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 150)
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground/60 transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus:border-ring/30",
          isFocused && "shadow-sm"
        )}
      />
      {isFocused && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/70 border border-border/60 rounded px-1.5 py-0.5">
          ESC
        </kbd>
      )}

      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-lg border border-border bg-card shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Loading...</div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.id || suggestion.label}`}
              type="button"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted/40 transition-colors",
                index === selectedIndex && "bg-muted/40"
              )}
              onMouseDown={() => handleSuggestionClick(suggestion.href)}
            >
              <span className="flex-1 min-w-0">
                <span className="font-medium truncate">{suggestion.label}</span>
                {suggestion.description && (
                  <span className="text-xs text-muted-foreground block truncate">{suggestion.description}</span>
                )}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{suggestion.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
