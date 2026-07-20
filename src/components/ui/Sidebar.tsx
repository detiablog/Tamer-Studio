"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./SidebarItem";
import { Home, Grid, Folder, ImageIcon, Film, Settings, FileText, Cpu } from "lucide-react";
import { usePermissions } from "@/components/auth/use-permissions";

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { isAdmin } = usePermissions();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className={"w-72 shrink-0 px-3 py-4" + (collapsed ? " hidden sm:block w-20" : "")}>
      <nav className="flex flex-col gap-1">
        <div className="mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">Main</div>
        <SidebarItem icon={Home} label="Dashboard" href="/dashboard" active={isActive("/dashboard")} />
        <SidebarItem icon={Grid} label="Workspace" href="/workspace" active={isActive("/workspace")} />
        <SidebarItem icon={Folder} label="Projects" href="/projects" active={isActive("/projects")} />
        <SidebarItem icon={ImageIcon} label="Media" href="/media" active={isActive("/media")} />
        <SidebarItem icon={Film} label="Production" href="/production" active={isActive("/production")} />
        <SidebarItem icon={Cpu} label="AI Platform" href="/ai" active={isActive("/ai")} />
        <SidebarItem icon={FileText} label="Publishing" href="/publishing" active={isActive("/publishing")} />
        <div className="mt-3 mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">
          Manage
        </div>
        <SidebarItem icon={Settings} label="Settings" href="/settings" active={isActive("/settings")} />
        {isAdmin && (
          <SidebarItem icon={Settings} label="Admin" href="/admin" active={isActive("/admin")} />
        )}
      </nav>
    </aside>
  );
}
