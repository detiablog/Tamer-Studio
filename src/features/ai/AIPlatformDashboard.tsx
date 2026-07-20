"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { AIProviderCard } from "@/components/ai/AIProviderCard";
import { PromptTemplateCard } from "@/components/ai/PromptTemplateCard";
import { aiPlatformStore, type AIProvider, type AIModel, type PromptTemplate, type AIUsageSummary } from "./ai.store";
import { toast } from "sonner";

export function AIPlatformDashboard() {
  const [providers, setProviders] = React.useState<AIProvider[]>([]);
  const [marketplace, setMarketplace] = React.useState<AIProvider[]>([]);
  const [models, setModels] = React.useState<AIModel[]>([]);
  const [templates, setTemplates] = React.useState<PromptTemplate[]>([]);
  const [usage, setUsage] = React.useState<AIUsageSummary | null>(null);
  const [providerSearch, setProviderSearch] = React.useState("");
  const [templateSearch, setTemplateSearch] = React.useState("");
  const [selectedProviderId, setSelectedProviderId] = React.useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");
  const [systemPrompt, setSystemPrompt] = React.useState("You are an expert AI assistant helping users prepare high-quality content prompts.");
  const [userPrompt, setUserPrompt] = React.useState("Write a concise AI platform summary for Tamer Studio.");
  const [temperature] = React.useState(0.7);
  const [topP] = React.useState(0.9);
  const [maxTokens] = React.useState(800);

  React.useEffect(() => {
    refreshState();
  }, []);

  const refreshState = () => {
    const platformProviders = aiPlatformStore.getProviders();
    setProviders(platformProviders);
    setMarketplace(aiPlatformStore.getMarketplaceProviders());
    setModels(aiPlatformStore.getModels());
    setTemplates(aiPlatformStore.getTemplates());
    setUsage(aiPlatformStore.getUsageSummary());
    if (!selectedProviderId && platformProviders.length) {
      setSelectedProviderId(platformProviders[0].id);
    }
  };

  const selectedProvider = providers.find((provider) => provider.id === selectedProviderId) ?? providers[0] ?? null;
  const providerModels = selectedProvider ? models.filter((model) => model.providerId === selectedProvider.id) : models;
  const filteredProviders = providers.filter((provider) => provider.name.toLowerCase().includes(providerSearch.toLowerCase()) || provider.category.toLowerCase().includes(providerSearch.toLowerCase()));
  const filteredTemplates = templates.filter((template) => template.name.toLowerCase().includes(templateSearch.toLowerCase()) || template.category.toLowerCase().includes(templateSearch.toLowerCase()) || template.description.toLowerCase().includes(templateSearch.toLowerCase()));

  const handleInstall = (id: string) => {
    aiPlatformStore.installProvider(id);
    refreshState();
    toast.success("Provider installed. Configure connections in the provider details.");
  };

  const handleToggleProvider = (id: string) => {
    aiPlatformStore.toggleProviderStatus(id);
    refreshState();
    toast.success("Connection status updated.");
  };

  const handleToggleFavoriteTemplate = (id: string) => {
    aiPlatformStore.toggleTemplateFavorite(id);
    refreshState();
  };

  const handleDuplicateTemplate = (id: string) => {
    aiPlatformStore.duplicateTemplate(id);
    refreshState();
    toast.success("Template duplicated.");
  };

  const handleGeneratePreview = () => {
    toast.success("AI preview is a placeholder UI. This experience is ready for future integration.");
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">AI Platform Dashboard</p>
              <h2 className="text-2xl font-semibold">Manage providers, models, and prompt workflows.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast.success("Provider catalog is already synced.")}>Refresh</Button>
              <Button variant="secondary" onClick={() => setProviderSearch("")}>Clear Search</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">Installed providers</p>
              <p className="mt-3 text-3xl font-semibold">{providers.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">Available models</p>
              <p className="mt-3 text-3xl font-semibold">{models.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">Prompt templates</p>
              <p className="mt-3 text-3xl font-semibold">{templates.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p className="mt-3 text-3xl font-semibold">{usage ? formatCurrency(usage.estimatedCost) : "—"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Platform health</p>
            <h3 className="text-lg font-semibold">Connected providers</h3>
          </div>
          <div className="grid gap-3">
            {providers.slice(0, 3).map((provider) => (
              <div key={provider.id} className="rounded-3xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.category}</p>
                  </div>
                  <Badge tone={provider.connectionStatus === "Connected" ? "success" : provider.connectionStatus === "Disconnected" ? "warning" : "info"}>
                    {provider.connectionStatus}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-[0.18em]">Default model</div>
                    <div className="mt-1 font-medium">{provider.defaultModel}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-[0.18em]">Updated</div>
                    <div className="mt-1 font-medium">{new Date(provider.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Provider catalog</p>
            <h3 className="text-xl font-semibold">Installed providers</h3>
          </div>
          <Input placeholder="Search installed providers" value={providerSearch} onChange={(event) => setProviderSearch(event.target.value)} className="max-w-md" />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {filteredProviders.map((provider) => (
            <AIProviderCard key={provider.id} provider={provider} onToggleConnection={handleToggleProvider} />
          ))}
          {filteredProviders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">No matching providers found.</div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prompt playground</p>
              <h3 className="text-xl font-semibold">Build prompts for any AI workflow</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGeneratePreview}>Preview</Button>
              <Button variant="secondary" onClick={() => toast.success("Prompt saved locally for future generation.")}>Save draft</Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Provider</label>
                <select value={selectedProvider?.id ?? ""} onChange={(event) => setSelectedProviderId(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Model</label>
                <select value={providerModels[0]?.id ?? ""} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  {providerModels.map((model) => (
                    <option key={model.id} value={model.id}>{model.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Prompt template</label>
                <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">System prompt</label>
                <textarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">User prompt</label>
                <textarea value={userPrompt} onChange={(event) => setUserPrompt(event.target.value)} rows={4} className="mt-2 w-full rounded-3xl border border-border bg-background px-3 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Temperature</p>
              <p className="mt-2 text-lg font-semibold">{temperature.toFixed(1)}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Top P</p>
              <p className="mt-2 text-lg font-semibold">{topP.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Max tokens</p>
              <p className="mt-2 text-lg font-semibold">{maxTokens}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-muted/20 p-5">
            <p className="text-sm text-muted-foreground">Response preview</p>
            <div className="mt-3 min-h-[160px] rounded-3xl bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              {selectedTemplateId
                ? `Preview will use the selected template and chosen model once AI execution is available.`
                : "Select a provider, model, and prompt template to preview a response."}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prompt library</p>
              <h3 className="text-xl font-semibold">Templates and workflow presets</h3>
            </div>
            <Input placeholder="Search templates" value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} className="max-w-xs" />
          </div>

          <div className="grid gap-4">
            {filteredTemplates.slice(0, 3).map((template) => (
              <PromptTemplateCard key={template.id} template={template} onToggleFavorite={handleToggleFavoriteTemplate} onDuplicate={handleDuplicateTemplate} />
            ))}
            {filteredTemplates.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">No templates match your search.</div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Usage analytics</p>
              <h3 className="text-xl font-semibold">Quota and cost insights</h3>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Most used provider</p>
              <p className="font-medium">{usage?.mostUsedProvider ?? "None"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Requests</p>
              <p className="mt-3 text-3xl font-semibold">{usage?.requests ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tokens</p>
              <p className="mt-3 text-3xl font-semibold">{usage?.tokens ?? 0}</p>
            </div>
            <div className="rounded-3xl border border-border bg-muted/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estimated cost</p>
              <p className="mt-3 text-3xl font-semibold">{usage ? formatCurrency(usage.estimatedCost) : "$0.00"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Daily requests</p>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <div className="space-y-2">
                {usage?.dailyRequests.map((value, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Day {index + 1}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (value / Math.max(...(usage.dailyRequests || [1])))*100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Provider distribution</p>
                <p className="text-sm text-muted-foreground">Requests %</p>
              </div>
              <div className="space-y-3">
                {usage ? Object.entries(usage.providerDistribution).map(([providerName, percent]) => (
                  <div key={providerName}>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{providerName}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                      <div className="h-2 rounded-full bg-secondary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Provider marketplace</p>
            <h3 className="text-xl font-semibold">Discover new AI providers</h3>
            <div className="grid gap-4">
              {marketplace.map((provider) => (
                <AIProviderCard key={provider.id} provider={provider} onInstall={handleInstall} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
