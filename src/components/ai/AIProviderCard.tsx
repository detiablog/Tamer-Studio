"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import type { AIProvider } from "@/features/ai/ai.store";

const statusTone: Record<string, "success" | "warning" | "info" | "muted"> = {
  Connected: "success",
  Disconnected: "warning",
  Error: "warning",
  Upgrading: "info",
};

export function AIProviderCard({
  provider,
  onToggleConnection,
  onInstall,
}: {
  provider: AIProvider;
  onToggleConnection?: (id: string) => void;
  onInstall?: (id: string) => void;
}) {
  const isInstalled = typeof onToggleConnection !== "undefined";

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-sm font-semibold text-foreground">{provider.logo}</div>
          <Badge tone={statusTone[provider.connectionStatus] ?? "muted"}>
            {provider.connectionStatus}
          </Badge>
        </div>
        <div className="space-y-1">
          <CardTitle>{provider.name}</CardTitle>
          <CardDescription>{provider.category}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{provider.description}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/50 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Default model</p>
            <p className="mt-2 font-medium">{provider.defaultModel}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Auth</p>
            <p className="mt-2 font-medium">{provider.authType}</p>
          </div>
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground">
          <div>{provider.supportedCapabilities.join(" • ")}</div>
          <div className="truncate">{provider.apiEndpoint}</div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {isInstalled ? (
            <Link href={{ pathname: "/ai/providers/[id]", query: { id: provider.id } }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:bg-muted/50">
              Details
            </Link>
          ) : null}
          {onInstall ? (
            <Button size="sm" onClick={() => onInstall(provider.id)}>
              Install
            </Button>
          ) : null}
        </div>
        {onToggleConnection ? (
          <Button size="sm" variant={provider.connectionStatus === "Connected" ? "destructive" : "secondary"} onClick={() => onToggleConnection(provider.id)}>
            {provider.connectionStatus === "Connected" ? "Disconnect" : "Connect"}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
