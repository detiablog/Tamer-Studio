"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminTopbar } from "./AdminTopbar";
import { AdminSidebar } from "./AdminSidebar";

type AdminShellProps = {
  children?: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="hidden w-72 border-r bg-sidebar p-3 dark:block sm:block">
        <AdminSidebar pathname={pathname} />
      </div>

      <div className="flex flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
