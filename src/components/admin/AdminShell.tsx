"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminTopbar } from "./AdminTopbar";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  children?: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("admin.sidebar.collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("admin.sidebar.collapsed", String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className={cn(
        "hidden border-r bg-sidebar p-3 dark:block sm:block transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-72"
      )}>
        <AdminSidebar pathname={pathname} collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      <div className="flex flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}