import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchInput({ placeholder = "Search...", onSearch }: { placeholder?: string; onSearch?: (query: string) => void }) {
  const [value, setValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value)
    }
  }

  return (
    <div className={cn("relative w-full max-w-lg transition-all duration-200", isFocused && "max-w-xl")}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        aria-label="Global search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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
    </div>
  )
}
