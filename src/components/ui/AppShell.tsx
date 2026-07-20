"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

type AppShellProps = {
  children?: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const collapsed = false;
  const router = useRouter();

  // session hook from Better Auth client
  const { data: session, isPending } = (authClient as unknown as { useSession?: () => { data: unknown; isPending: boolean } }).useSession?.() ?? { data: null, isPending: false };

  // If session is pending, show a simple loader to avoid flicker
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking session…</div>
      </div>
    );
  }

  // If there's no session, redirect client-side to login
  // Only perform redirect on client; AppShell is a client component
  if (!session) {
    if (typeof window !== "undefined") {
      router.push("/login");
    }

    return null;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="hidden w-72 border-r bg-sidebar p-3 dark:block sm:block">
        <Sidebar collapsed={collapsed} />
      </div>

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
