"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalizationContext } from "@/providers/localization";
import { getAllTranslationKeys } from "@/lib/localization/keys";
import { FLATTENED_EN } from "@/lib/localization/translations";
import { Search, Check, ChevronDown } from "lucide-react";

const NAMESPACE_GROUPS = [
  { key: "common", label: "Common" },
  { key: "auth", label: "Authentication" },
  { key: "marketing", label: "Marketing" },
  { key: "dashboard", label: "Dashboard" },
  { key: "workspace", label: "Workspace" },
  { key: "settings", label: "Settings" },
  { key: "billing", label: "Billing" },
  { key: "profile", label: "Profile" },
  { key: "admin", label: "Admin" },
  { key: "misc", label: "Misc" },
  { key: "error", label: "Errors" },
];

export function TranslationKeyPicker({
  value,
  onChange,
  placeholder = "Select translation key",
}: {
  value: string;
  onChange: (key: string) => void;
  placeholder?: string;
}) {
  const { t } = useLocalizationContext();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const allKeys = React.useMemo(() => {
    try {
      return getAllTranslationKeys();
    } catch {
      return Object.keys(FLATTENED_EN);
    }
  }, []);

  const grouped = React.useMemo(() => {
    const query = search.toLowerCase().trim();
    const result: Record<string, Array<{ key: string; value: string }>> = {};

    for (const [key, val] of Object.entries(FLATTENED_EN)) {
      if (query && !key.toLowerCase().includes(query)) continue;
      const namespace = key.split(".")[0];
      if (!result[namespace]) result[namespace] = [];
      result[namespace].push({
        key,
        value: typeof val === "string" ? val : key,
      });
    }

    return result;
  }, [search]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs whitespace-nowrap"
        title="Translate from key"
      >
        <Search className="size-3.5" />
        {value ? "Key selected" : placeholder}
        <ChevronDown className="size-3.5 ml-1" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-96 max-h-96 overflow-hidden flex flex-col rounded-lg border border-border bg-popover shadow-lg z-50">
          <div className="p-2 space-y-2 border-b border-border">
            <Label className="text-xs text-muted-foreground">Translation Keys</Label>
            <Input
              placeholder="Search keys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
          </div>
          <div className="p-2 flex-1 overflow-y-auto space-y-2 max-h-64">
            {NAMESPACE_GROUPS.map((group) => {
              const keys = grouped?.[group.key];
              if (!keys || keys.length === 0) return null;
              return (
                <div key={group.key}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 px-1">{group.label}</p>
                  <div className="space-y-0.5">
                    {keys.slice(0, 20).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onChange(item.key);
                          setOpen(false);
                          setSearch("");
                        }}
                        className={`w-full text-left rounded-md px-2 py-1.5 text-xs transition hover:bg-muted flex items-start justify-between gap-2 ${
                          value === item.key ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        <span className="font-mono text-muted-foreground shrink-0">{item.key}</span>
                        <span className="truncate flex-1">{item.value}</span>
                        {value === item.key && <Check className="size-3 text-primary shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {(grouped ? Object.keys(grouped).length === 0 : true) && (
              <p className="text-xs text-muted-foreground text-center py-4">No keys found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
