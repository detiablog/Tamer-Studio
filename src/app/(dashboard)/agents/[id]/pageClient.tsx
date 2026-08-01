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
  Bot, ListTodo, History, Brain, BookOpen, Settings,
  ArrowLeft, Loader2, Plus, Trash2, Star,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AgentDetailPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"tasks" | "memory" | "knowledge" | "runs" | "settings">("tasks");
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newMemoryKey, setNewMemoryKey] = React.useState("");
  const [newMemoryContent, setNewMemoryContent] = React.useState("");

  const { data: agentData, isLoading } = useSWR(`/api/agents/${id}`, fetcher);
  const agent = agentData?.data;

  const { data: tasksData } = useSWR(`/api/agents/${id}/tasks`, fetcher);
  const tasks = tasksData?.data || [];

  const { data: memoryData } = useSWR(`/api/agents/${id}/memory`, fetcher);
  const memories = memoryData?.data || [];

  const { data: knowledgeData } = useSWR(`/api/agents/${id}/knowledge`, fetcher);
  const knowledge = knowledgeData?.data || [];

  const { data: runsData } = useSWR(`/api/agents/${id}/runs`, fetcher);
  const runs = runsData?.data || [];

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch(`/api/agents/${id}/tasks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const data = await res.json();
      if (data.success) { toast.success(t("agents.taskCreated")); setNewTaskTitle(""); window.location.reload(); }
    } catch { toast.error(t("common.error")); }
  };

  const handleAddMemory = async () => {
    if (!newMemoryKey.trim() || !newMemoryContent.trim()) return;
    try {
      const res = await fetch(`/api/agents/${id}/memory`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newMemoryKey, content: newMemoryContent, type: "long_term" }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Memory added"); setNewMemoryKey(""); setNewMemoryContent(""); window.location.reload(); }
    } catch { toast.error(t("common.error")); }
  };

  const tabs = [
    { key: "tasks" as const, label: t("agents.tasks"), icon: ListTodo },
    { key: "memory" as const, label: t("agents.memory"), icon: Brain },
    { key: "knowledge" as const, label: t("agents.knowledge"), icon: BookOpen },
    { key: "runs" as const, label: t("agents.history"), icon: History },
    { key: "settings" as const, label: t("agents.settings"), icon: Settings },
  ];

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: t("dashboard.title", "Dashboard"), href: "/agents" },
        { label: agent?.name || t("agents.myAgents"), href: "/agents" },
        { label: t("agents.tasks") },
      ]} />

      {agent && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}><ArrowLeft className="size-4" /></Button>
          <div className="text-3xl">🤖</div>
          <div>
            <h2 className="font-heading text-xl font-semibold">{agent.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{agent.type} · {agent.role || t("agents.agentRole")}</p>
          </div>
          <Badge variant={agent.status === "active" ? "default" : "secondary"} className="ml-auto">{agent.status}</Badge>
        </div>
      )}

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <tab.icon className="size-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "tasks" && (
        <div className="space-y-4">
          <DashboardCard>
            <div className="flex gap-2">
              <Input placeholder={t("agents.taskTitle")} value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTask()} className="flex-1" />
              <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}><Plus className="mr-2 size-4" />Add Task</Button>
            </div>
          </DashboardCard>
          {tasks.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noTasks")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {tasks.map((task: { id: string; title: string; status: string; priority: string; createdAt: string }) => (
                <DashboardCard key={task.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ListTodo className="size-4 text-muted-foreground" />
                      <div><p className="text-sm font-medium">{task.title}</p><p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleString()}</p></div>
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : task.status === "failed" ? "destructive" : "secondary"}>{task.status}</Badge>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "memory" && (
        <div className="space-y-4">
          <DashboardCard>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder={t("agents.memoryKey")} value={newMemoryKey} onChange={(e) => setNewMemoryKey(e.target.value)} />
              <Input placeholder={t("agents.memoryContent")} value={newMemoryContent} onChange={(e) => setNewMemoryContent(e.target.value)} />
            </div>
            <Button onClick={handleAddMemory} disabled={!newMemoryKey.trim() || !newMemoryContent.trim()} className="mt-2">
              <Plus className="mr-2 size-4" />Add Memory
            </Button>
          </DashboardCard>
          {memories.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noMemory")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {memories.map((mem: { id: string; key: string; content: string; type: string; isPinned: boolean }) => (
                <DashboardCard key={mem.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1"><p className="text-sm font-medium">{mem.key}</p><p className="text-xs text-muted-foreground mt-1">{mem.content}</p></div>
                    <div className="flex items-center gap-1">
                      {mem.isPinned && <Star className="size-4 text-yellow-500 fill-yellow-500" />}
                      <Badge variant="outline">{mem.type}</Badge>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-4">
          <DashboardCard><Button><Plus className="mr-2 size-4" />Add Knowledge Source</Button></DashboardCard>
          {knowledge.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noKnowledge")}</div></DashboardCard>
          ) : (
            <div className="space-y-2">
              {knowledge.map((k: { id: string; name: string; sourceType: string; content?: string }) => (
                <DashboardCard key={k.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1"><p className="text-sm font-medium">{k.name}</p>{k.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{k.content}</p>}</div>
                    <div className="flex items-center gap-2"><Badge variant="outline">{k.sourceType}</Badge>
                      <Button variant="ghost" size="icon" className="size-8"><Trash2 className="size-3.5" /></Button>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "runs" && (
        <div className="space-y-2">
          {runs.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("agents.noRuns")}</div></DashboardCard>
          ) : (
            runs.map((run: { id: string; status: string; model?: string; creditsUsed: number; executionTimeMs?: number; createdAt: string }) => (
              <DashboardCard key={run.id}>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{run.model || "AI Model"}</p><p className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</p></div>
                  <div className="flex items-center gap-2">
                    <Badge variant={run.status === "completed" ? "default" : run.status === "failed" ? "destructive" : "secondary"}>{run.status}</Badge>
                    <span className="text-xs text-muted-foreground">{run.creditsUsed}cr</span>
                  </div>
                </div>
              </DashboardCard>
            ))
          )}
        </div>
      )}

      {activeTab === "settings" && (
        <DashboardCard>
          <h3 className="font-heading font-semibold mb-4">{t("agents.settings")}</h3>
          {agent && (
            <div className="space-y-3">
              <div><Label>{t("agents.agentName")}</Label><Input defaultValue={agent.name} className="mt-1" /></div>
              <div><Label>{t("agents.agentType")}</Label><Badge variant="outline" className="mt-1">{agent.type}</Badge></div>
              {agent.role && <div><Label>{t("agents.agentRole")}</Label><p className="text-sm mt-1">{agent.role}</p></div>}
              <Button><Settings className="mr-2 size-4" />Save Settings</Button>
            </div>
          )}
        </DashboardCard>
      )}
    </div>
  );
}
