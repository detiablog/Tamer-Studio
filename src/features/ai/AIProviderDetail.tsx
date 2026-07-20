"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { aiPlatformStore, type AIProvider, type AIModel } from "./ai.store";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AIProviderDetail({ id }: { id: string }) {
  const [provider, setProvider] = React.useState<AIProvider | null>(null);
  const [models, setModels] = React.useState<AIModel[]>([]);
  const [defaultModel, setDefaultModel] = React.useState("");

  React.useEffect(() => {
    const current = aiPlatformStore.getProvider(id);
    setProvider(current);
    if (current) {
      setDefaultModel(current.defaultModel);
      setModels(aiPlatformStore.getModelsByProvider(current.id));
    }
  }, [id]);

  const handleToggleConnection = () => {
    aiPlatformStore.toggleProviderStatus(id);
    const updated = aiPlatformStore.getProvider(id);
    setProvider(updated);
    toast.success("Connection status updated.");
  };

  const handleSaveDefaultModel = () => {
    if (!provider) return;
    aiPlatformStore.updateProvider(provider.id, { defaultModel });
    setProvider(aiPlatformStore.getProvider(provider.id));
    toast.success("Default model updated.");
  };

  if (!provider) {
    return (
      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        Provider not found. <Link href="/ai" className="text-primary hover:underline">Return to AI platform.</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" />
          <Link href="/ai" className="hover:text-foreground">Back to AI platform</Link>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant={provider.connectionStatus === "Connected" ? "destructive" : "secondary"} onClick={handleToggleConnection}>
            {provider.connectionStatus === "Connected" ? "Disconnect" : "Connect"}
          </Button>
          <Button onClick={() => toast.success("Provider settings are managed locally.")}>Save Settings</Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-6">
          <CardHeader>
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-lg font-semibold text-foreground">{provider.logo}</div>
                <div>
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription>{provider.category}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Connection</p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={provider.connectionStatus === "Connected" ? "success" : provider.connectionStatus === "Disconnected" ? "warning" : "info"}>
                  {provider.connectionStatus}
                </Badge>
                <span className="text-sm text-muted-foreground">Last updated {new Date(provider.updatedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">API endpoint</p>
                <p className="mt-2 break-all font-medium text-foreground">{provider.apiEndpoint}</p>
              </div>
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Authentication</p>
                <p className="mt-2 font-medium">{provider.authType}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-semibold">Description</p>
              <p className="mt-2 text-sm text-muted-foreground">{provider.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Default model</label>
                <select value={defaultModel} onChange={(event) => setDefaultModel(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  {models.map((model) => (
                    <option key={model.id} value={model.name}>{model.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-3xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold">Credential management</p>
                <div className="mt-2 text-sm text-muted-foreground">API Key and token lifecycle are managed inside your AI provider settings. Use the button below to refresh credentials when needed.</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => toast.success("Credential refresh is mocked for this UI.")}>Refresh credentials</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.success("Credential preview is disabled for security.")}>View credential status</Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={handleSaveDefaultModel}>Save model</Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Model catalog</CardTitle>
              <CardDescription>Models available for this provider.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">No models configured yet.</div>
              ) : (
                <div className="space-y-3">
                  {models.map((model) => (
                    <div key={model.id} className="rounded-3xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{model.displayName}</p>
                          <p className="text-sm text-muted-foreground">{model.category}</p>
                        </div>
                        <Badge tone={model.status === "Available" ? "success" : model.status === "Preview" ? "info" : "muted"}>{model.status}</Badge>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
                        <div>Context: {model.contextLength}</div>
                        <div>Max tokens: {model.maxTokens}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Provider details</CardTitle>
              <CardDescription>Review supported capabilities and version history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="rounded-3xl border border-border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Capabilities</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-foreground">{provider.supportedCapabilities.map((capability) => (<span key={capability} className="rounded-full bg-muted px-2 py-1">{capability}</span>))}</div>
                </div>
                <div className="rounded-3xl border border-border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Version</p>
                  <p className="mt-2 font-medium">{provider.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
