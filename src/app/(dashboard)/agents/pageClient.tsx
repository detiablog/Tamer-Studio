"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Bot, ListTodo, History, Brain, BookOpen, Sparkles,
  Plus, Search, Loader2, Zap, ChevronRight, Play, Settings,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const AGENT_TYPES = [
  { key: "general", label: "General Assistant", icon: "🤖" },
  { key: "marketing", label: "Marketing Agent", icon: "📣" },
  { key: "affiliate", label: "Affiliate Agent", icon: "💰" },
  { key: "drama", label: "Drama Director", icon: "🎬" },
  { key: "image", label: "Image Designer", icon: "🎨" },
  { key: "video", label: "Video Producer", icon: "🎥" },
  { key: "script", label: "Script Writer", icon: "✍️" },
  { key: "seo", label: "SEO Specialist", icon: "🔍" },
];

type Stats = {
  totalAgents: number;
  totalTasks: number;
  completedTasks: number;
  totalCreditsUsed: number;
  totalMemory: number;
  totalKnowledge: number;
};

type Agent = {
  id: string;
  name: string;
  type: string;
  role?: string;
  status: string;
  description?: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  agentId: string;
  createdAt: string;
};

export default function AgentPlatformPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"dashboard" | "agents" | "tasks" | "memory" | "knowledge" | "history">("dashboard");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null);

  const { data: statsData } = useSWR("/api/agents/stats", fetcher);
  const stats: Stats = statsData?.data || { totalAgents: 0, totalTasks: 0, completedTasks: 0, totalCreditsUsed: 0, totalMemory: 0, totalKnowledge: 0 };

  const { data: agentsData, isLoading: loadingAgents } = useSWR("/api/agents", fetcher);
  const agents: Agent[] = agentsData?.data || [];

  const { data: tasksData } = useSWR("/api/agents/tasks?limit=20", fetcher);
  const tasks: Task[] = tasksData?.data || [];

  const { data: memoryData } = useSWR(selectedAgentId ? `/api/agents/${selectedAgentId}/memory` : null, fetcher);
  const memories = memoryData?.data || [];

  const { data: knowledgeData } = useSWR(selectedAgentId ? `/api/agents/${selectedAgentId}/knowledge` : null, fetcher);
  const knowledge = knowledgeData?.data || [];

  const { data: runsData } = useSWR(selectedAgentId ? `/api/agents/${selectedAgentId}/runs` : null, fetcher);
  const runs = runsData?.data || [];

  const tabs = [
    { key: "dashboard" as const, label: t("agents.dashboard"), icon: Sparkles },
    { key: "agents" as const, label: t("agents.myAgents"), icon: Bot },
    { key: "tasks" as const, label: t("agents.tasks"), icon: ListTodo },
    { key: "memory" as const, label: t("agents.memory"), icon: Brain },
    { key: "knowledge" as const, label: t("agents.knowledge"), icon: BookOpen },
    { key: "history" as const, label: t("agents.history"), icon: History },
  ];

  const handleCreateAgent = async (type: string) => {
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${AGENT_TYPES.find(a => a.key === type)?.label || "Agent"} ${Date.now()}`, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("agents.agentCreated"));
        window.location.reload();
      } else {
        toast.error(data.error || t("common.error"));
      }
    } catch { toast.error(t("common.error")); }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("dashboard.title", "Dashboard") }, { label: t("agents.title") }]} />
      <PageHeader title={t("agents.title")} description={t("agents.description")} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("agents.totalAgents"), value: stats.totalAgents, icon: Bot },
          { label: t("agents.activeTasks"), value: stats.totalTasks, icon: ListTodo },
          { label: t("agents.completedTasks"), value: stats.completedTasks, icon: History },
          { label: t("agents.creditsUsed"), value: stats.totalCreditsUsed, icon: Zap },
        ].map((card) => (
          <DashboardCard key={card.label}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><card.icon className="size-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{card.value}</p><p className="text-xs text-muted-foreground">{card.label}</p></div>
            </div>
          </DashboardCard>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <tab.icon className="size-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("agents.myAgents")}</h3>
            <Button onClick={() => setActiveTab("agents")}><Plus className="mr-2 size-4" />{t("agents.createAgent")}</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.slice(0, 6).map((agent) => (
              <div key={agent.id} className="cursor-pointer" onClick={() => { setSelectedAgentId(agent.id); setActiveTab("memory"); }}>
              <DashboardCard>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{AGENT_TYPES.find(a => a.key === agent.type)?.icon || "🤖"}</div>
                    <div>
                      <h4 className="font-medium text-sm">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{agent.type}</p>
                    </div>
                  </div>
                  <Badge tone={agent.status === "active" ? "default" : "muted"}>{agent.status}</Badge>
                </div>
                {agent.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{agent.description}</p>}
              </DashboardCard>
              </div>
            ))}
          </div>
          {tasks.length > 0 && (
            <>
              <h3 className="font-heading font-semibold">{t("agents.tasks")}</h3>
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <DashboardCard key={task.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ListTodo className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={task.status === "completed" ? "default" : task.status === "running" ? "info" : "muted"}>{task.status}</Badge>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </DashboardCard>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "agents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="size-4 text-muted-foreground" />
              <Input placeholder={t("agents.searchAgents", "Search agents...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button><Plus className="mr-2 size-4" />{t("agents.createAgent")}</Button>
          </div>
          {loadingAgents ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : agents.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noAgents")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div key={agent.id} className="cursor-pointer"
                  onClick={() => window.location.href = `/agents/${agent.id}`}>
                <DashboardCard>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{AGENT_TYPES.find(a => a.key === agent.type)?.icon || "🤖"}</div>
                      <div><h4 className="font-medium">{agent.name}</h4><p className="text-xs text-muted-foreground capitalize">{agent.type}</p></div>
                    </div>
                    <Badge tone={agent.status === "active" ? "default" : "muted"}>{agent.status}</Badge>
                  </div>
                  {agent.description && <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleCreateAgent(agent.type); }}>
                      <Play className="mr-1 size-3" />Run
                    </Button>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
                      <Settings className="size-3" />
                    </Button>
                  </div>
                </DashboardCard>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8">
            <h3 className="font-heading font-semibold mb-4">{t("agents.marketplace")}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AGENT_TYPES.map((at) => (
                <div key={at.key} className="cursor-pointer"
                  onClick={() => handleCreateAgent(at.key)}>
                <DashboardCard>
                  <div className="text-3xl mb-2">{at.icon}</div>
                  <p className="text-sm font-medium">{at.label}</p>
                </DashboardCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noTasks")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <DashboardCard key={task.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ListTodo className="size-4 text-muted-foreground" />
                      <div><p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={
                        task.status === "completed" ? "default" :
                        task.status === "running" ? "info" :
                        task.status === "failed" ? "warning" : "muted"
                      }>{task.status}</Badge>
                      <Badge tone="default">{task.priority}</Badge>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "memory" && (
        <div className="space-y-4">
          {!selectedAgentId ? (
            <div className="space-y-3">
              <h3 className="font-heading font-semibold">{t("agents.selectAgent", "Select an agent to view memory")}</h3>
              {agents.map((agent) => (
                <div key={agent.id} className="cursor-pointer"
                  onClick={() => setSelectedAgentId(agent.id)}>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{AGENT_TYPES.find(a => a.key === agent.type)?.icon || "🤖"}</div>
                    <div><p className="font-medium text-sm">{agent.name}</p><p className="text-xs text-muted-foreground capitalize">{agent.type}</p></div>
                    <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                  </div>
                </DashboardCard>
                </div>
              ))}
            </div>
          ) : memories.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noMemory")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {memories.map((mem: { id: string; key: string; content: string; type: string; isPinned: boolean }) => (
                <DashboardCard key={mem.id}>
                  <div className="flex items-start justify-between">
                    <div><p className="text-sm font-medium">{mem.key}</p><p className="text-xs text-muted-foreground mt-1">{mem.content}</p></div>
                    <div className="flex gap-1"><Badge tone="default">{mem.type}</Badge>{mem.isPinned && <Badge tone="default">📌</Badge>}</div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-4">
          {!selectedAgentId ? (
            <div className="space-y-3">
              <h3 className="font-heading font-semibold">{t("agents.selectAgentKnowledge", "Select an agent to view knowledge")}</h3>
              {agents.map((agent) => (
                <div key={agent.id} className="cursor-pointer"
                  onClick={() => setSelectedAgentId(agent.id)}>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{AGENT_TYPES.find(a => a.key === agent.type)?.icon || "🤖"}</div>
                    <div><p className="font-medium text-sm">{agent.name}</p></div>
                    <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                  </div>
                </DashboardCard>
                </div>
              ))}
            </div>
          ) : knowledge.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noKnowledge")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {knowledge.map((k: { id: string; name: string; sourceType: string; content?: string }) => (
                <DashboardCard key={k.id}>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">{k.name}</p>{k.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{k.content}</p>}</div>
                    <Badge tone="default">{k.sourceType}</Badge>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {!selectedAgentId ? (
            <div className="space-y-3">
              <h3 className="font-heading font-semibold">{t("agents.selectAgentHistory", "Select an agent to view run history")}</h3>
              {agents.map((agent) => (
                <div key={agent.id} className="cursor-pointer"
                  onClick={() => setSelectedAgentId(agent.id)}>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{AGENT_TYPES.find(a => a.key === agent.type)?.icon || "🤖"}</div>
                    <div><p className="font-medium text-sm">{agent.name}</p></div>
                    <ChevronRight className="size-4 text-muted-foreground ml-auto" />
                  </div>
                </DashboardCard>
                </div>
              ))}
            </div>
          ) : runs.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noRuns")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {runs.map((run: { id: string; status: string; model?: string; creditsUsed: number; executionTimeMs?: number; createdAt: string }) => (
                <DashboardCard key={run.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div><p className="text-sm font-medium">{run.model || "AI Model"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={run.status === "completed" ? "default" : run.status === "failed" ? "warning" : "muted"}>{run.status}</Badge>
                      <span className="text-xs text-muted-foreground">{run.creditsUsed} credits</span>
                      {run.executionTimeMs && <span className="text-xs text-muted-foreground">{(run.executionTimeMs / 1000).toFixed(1)}s</span>}
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
