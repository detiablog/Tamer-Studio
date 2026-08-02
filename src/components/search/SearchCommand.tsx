"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SearchCommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function SearchCommand({ open: controlledOpen, onOpenChange }: SearchCommandProps) {
  const [isOpenState, setIsOpen] = React.useState(controlledOpen ?? false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isOpen = controlledOpen ?? isOpenState;
  const setOpen = onOpenChange ?? setIsOpen;

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", shortcut: "D", href: "/dashboard" },
    { id: "projects", label: "Projects", shortcut: "P", href: "/dashboard/projects" },
    { id: "image-studio", label: "AI Image Studio", shortcut: "I", href: "/dashboard/ai/image" },
    { id: "video-studio", label: "AI Video Studio", shortcut: "V", href: "/dashboard/ai/video" },
    { id: "prompts", label: "Prompt Intelligence", shortcut: "R", href: "/dashboard/prompts" },
    { id: "orchestrator", label: "AI Orchestrator", shortcut: "O", href: "/dashboard/orchestrator" },
    { id: "automation", label: "Automation Center", shortcut: "A", href: "/dashboard/automation" },
    { id: "quality", label: "Quality Assurance", shortcut: "Q", href: "/dashboard/quality" },
    { id: "assets", label: "Asset Intelligence", shortcut: "S", href: "/dashboard/assets/intelligence" },
    { id: "learning", label: "Learning Engine", shortcut: "L", href: "/dashboard/learning" },
    { id: "memory", label: "Creative Memory", shortcut: "M", href: "/dashboard/memory" },
    { id: "analytics", label: "Analytics", shortcut: "N", href: "/dashboard/analytics" },
    { id: "publishing", label: "Publishing", shortcut: "U", href: "/dashboard/publishing" },
    { id: "settings", label: "Settings", shortcut: ",", href: "/dashboard/settings" },
  ];

  const filteredItems = query ? navigationItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase())) : navigationItems;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, setOpen]);

  React.useEffect(() => {
    if (isOpen) { setQuery(""); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  React.useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      window.location.href = filteredItems[selectedIndex].href;
    }
    else if (e.key === "Escape") { setOpen(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl mx-4 bg-background rounded-xl border shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <span className="text-muted-foreground mr-3 text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything..."
            className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No results found</div>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => { window.location.href = item.href; setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
              >
                <span className="flex-1 text-left">{item.label}</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {item.shortcut}
                </kbd>
              </button>
            ))
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Navigate with ↑↓ • Select with ↵ • Close with esc</span>
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">⌘K</span>
        </div>
      </div>
    </div>
  );
}

export { SearchCommand };
