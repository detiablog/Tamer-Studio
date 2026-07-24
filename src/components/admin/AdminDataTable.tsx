"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Filter,
  Search,
  ArrowUpDown,
} from "lucide-react";

type ColumnDef<T> = {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  visible?: boolean;
};

type SortDirection = "asc" | "desc" | null;

type AdminDataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pageSize?: number;
};

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyTitle = "No data",
  emptyDescription = "There are no records to display.",
  searchPlaceholder = "Search...",
  onSearch,
  pageSize = 10,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});
  const [columnMenuOpen, setColumnMenuOpen] = React.useState(false);

  const visibleColumns = columns.filter((col) => columnVisibility[col.key] !== false);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      } else {
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return sortedData;
    const q = search.toLowerCase();
    return sortedData.filter((item) =>
      visibleColumns.some((col) => {
        const val = (item as Record<string, unknown>)[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [sortedData, search, visibleColumns]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  const allSelected = pagedData.length > 0 && pagedData.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected = pagedData.some((item) => selectedIds.has(keyExtractor(item)));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedData.forEach((item) => next.delete(keyExtractor(item)));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pagedData.forEach((item) => next.add(keyExtractor(item)));
        return next;
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.size} selected item(s)?`)) return;
    clearSelection();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
    onSearch?.(value);
  };

  const resetFilters = () => {
    setSearch("");
    setSortKey(null);
    setSortDir(null);
    clearSelection();
    setPage(0);
  };

  const hasActiveFilters = search.trim() || sortKey !== null || selectedIds.size > 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {onSearch !== undefined && (
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setColumnMenuOpen(!columnMenuOpen)}
          className="gap-1"
        >
          <Columns2 className="size-4" />
          Columns
        </Button>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedIds.size} selected</span>
            <Button variant="ghost" size="sm" onClick={bulkDelete} className="text-destructive hover:text-destructive">
              Delete Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
          </div>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
            <Filter className="size-4" />
            Reset
          </Button>
        )}
      </div>

      {columnMenuOpen && (
        <div className="absolute z-50 mt-1 rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="text-xs font-medium text-muted-foreground mb-2">Toggle Columns</div>
          <div className="space-y-1">
            {columns.map((col) => (
              <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={columnVisibility[col.key] !== false}
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, [col.key]: checked }))
                  }
                />
                {String(col.header)}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="w-full overflow-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-3 py-2 w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} ref={undefined} />
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground select-none",
                    col.sortable !== false && "cursor-pointer hover:text-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.width && `w-[${col.width}]`
                  )}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (sortDir === "asc" ? <ChevronUp className="size-3" /> : sortDir === "desc" ? <ChevronDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">{emptyTitle}</p>
                    <p className="text-xs">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedData.map((item) => {
                const id = keyExtractor(item);
                return (
                  <tr key={id} className="border-b border-border/60 transition hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selectedIds.has(id)}
                        onCheckedChange={() => toggleSelect(id)}
                        ref={undefined}
                      />
                    </td>
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 align-middle",
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center"
                        )}
                      >
                        {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredData.length === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredData.length)} of {filteredData.length}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-xs" onClick={() => setPage(0)} disabled={page === 0}>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-xs" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="px-2 text-xs">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="icon-xs" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="icon-xs" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}