"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ColumnDef<T> = {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (item: T) => React.ReactNode;
};

type AdminDataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyTitle = "No data",
  emptyDescription = "There are no records to display.",
}: AdminDataTableProps<T>) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.width && `w-[${col.width}]`
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <p className="font-medium">{emptyTitle}</p>
                  <p className="text-xs">{emptyDescription}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="border-b border-border/60 transition hover:bg-muted/30">
                {columns.map((col) => (
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
