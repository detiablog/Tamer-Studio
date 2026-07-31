"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";
import {
  Save,
  Play,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowLeft,
  Loader,
  X,
  MousePointer2,
  Trash2,
  FileText,
  Image as ImageIcon,
  Film,
  PenTool,
  MessageSquare,
  Upload,
  Variable,
  LayoutTemplate,
  Copy,
  Split,
  Merge,
  Clock,
  Zap,
  Database,
  Bell,
  Send,
  Settings2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

interface CanvasNode {
  id: string;
  type: string;
  label: string;
  category: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

interface NodeCategory {
  id: string;
  labelKey: string;
  label: string;
  nodes: { type: string; label: string; icon: any; color: string }[];
}

const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: "input",
    labelKey: "workflows.nodeCategories.input",
    label: "Input",
    nodes: [
      { type: "prompt", label: "Prompt", icon: FileText, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      { type: "reference_image", label: "Reference Image", icon: ImageIcon, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      { type: "upload", label: "Upload", icon: Upload, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
      { type: "template", label: "Template", icon: LayoutTemplate, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
      { type: "variable", label: "Variable", icon: Variable, color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    ],
  },
  {
    id: "ai",
    labelKey: "workflows.nodeCategories.ai",
    label: "AI",
    nodes: [
      { type: "ai_image", label: "AI Image", icon: ImageIcon, color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
      { type: "ai_video", label: "AI Video", icon: Film, color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
      { type: "ai_storyboard", label: "Storyboard", icon: PenTool, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      { type: "ai_caption", label: "Caption", icon: MessageSquare, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    ],
  },
  {
    id: "processing",
    labelKey: "workflows.nodeCategories.processing",
    label: "Processing",
    nodes: [
      { type: "resize", label: "Resize", icon: Maximize2, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      { type: "crop", label: "Crop", icon: Copy, color: "bg-lime-500/10 text-lime-500 border-lime-500/20" },
      { type: "convert", label: "Convert", icon: Settings2, color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
      { type: "thumbnail", label: "Thumbnail", icon: ImageIcon, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    ],
  },
  {
    id: "logic",
    labelKey: "workflows.nodeCategories.logic",
    label: "Logic",
    nodes: [
      { type: "condition", label: "Condition", icon: Zap, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      { type: "delay", label: "Delay", icon: Clock, color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
      { type: "merge", label: "Merge", icon: Merge, color: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" },
      { type: "split", label: "Split", icon: Split, color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
    ],
  },
  {
    id: "output",
    labelKey: "workflows.nodeCategories.output",
    label: "Output",
    nodes: [
      { type: "storage", label: "Storage", icon: Database, color: "bg-green-500/10 text-green-500 border-green-500/20" },
      { type: "notification", label: "Notification", icon: Bell, color: "bg-red-500/10 text-red-500 border-red-500/20" },
      { type: "publish", label: "Publish", icon: Send, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    ],
  },
];

const NODE_CONFIG_FIELDS: Record<string, { label: string; type: string; placeholder?: string }[]> = {
  prompt: [
    { label: "Prompt Text", type: "textarea", placeholder: "Enter your prompt..." },
    { label: "Model", type: "select" },
  ],
  reference_image: [
    { label: "Image URL", type: "text", placeholder: "https://..." },
    { label: "Strength", type: "number", placeholder: "0.75" },
  ],
  upload: [
    { label: "File Type", type: "select" },
    { label: "Max Size (MB)", type: "number", placeholder: "10" },
  ],
  template: [
    { label: "Template ID", type: "text", placeholder: "tpl-xxx" },
  ],
  variable: [
    { label: "Variable Name", type: "text", placeholder: "my_var" },
    { label: "Default Value", type: "text", placeholder: "default" },
  ],
  ai_image: [
    { label: "Model", type: "select" },
    { label: "Size", type: "select" },
    { label: "Quality", type: "select" },
  ],
  ai_video: [
    { label: "Model", type: "select" },
    { label: "Duration (s)", type: "number", placeholder: "15" },
    { label: "Resolution", type: "select" },
  ],
  ai_storyboard: [
    { label: "Model", type: "select" },
    { label: "Scenes", type: "number", placeholder: "6" },
  ],
  ai_caption: [
    { label: "Model", type: "select" },
    { label: "Language", type: "select" },
    { label: "Style", type: "select" },
  ],
  resize: [
    { label: "Width", type: "number", placeholder: "1920" },
    { label: "Height", type: "number", placeholder: "1080" },
    { label: "Maintain Ratio", type: "toggle" },
  ],
  crop: [
    { label: "X", type: "number", placeholder: "0" },
    { label: "Y", type: "number", placeholder: "0" },
    { label: "Width", type: "number", placeholder: "100" },
    { label: "Height", type: "number", placeholder: "100" },
  ],
  convert: [
    { label: "Format", type: "select" },
    { label: "Quality", type: "number", placeholder: "90" },
  ],
  thumbnail: [
    { label: "Width", type: "number", placeholder: "300" },
    { label: "Height", type: "number", placeholder: "200" },
  ],
  condition: [
    { label: "Condition Type", type: "select" },
    { label: "Value", type: "text", placeholder: "condition..." },
  ],
  delay: [
    { label: "Duration (ms)", type: "number", placeholder: "1000" },
  ],
  merge: [
    { label: "Strategy", type: "select" },
  ],
  split: [
    { label: "Split By", type: "select" },
  ],
  storage: [
    { label: "Provider", type: "select" },
    { label: "Path", type: "text", placeholder: "/output/" },
  ],
  notification: [
    { label: "Channel", type: "select" },
    { label: "Message", type: "text", placeholder: "Task completed!" },
  ],
  publish: [
    { label: "Platform", type: "select" },
    { label: "Visibility", type: "select" },
  ],
};

export function WorkflowCanvasPageClient() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data, error, isLoading, mutate } = useSWR(id ? `/api/workflows/${id}` : null, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const [workflow, setWorkflow] = React.useState<any>(null);
  const [nodes, setNodes] = React.useState<CanvasNode[]>([]);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({ input: true, ai: true });
  const [zoom, setZoom] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [draggingNode, setDraggingNode] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<{ nodes: CanvasNode[]; connections: Connection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [workflowName, setWorkflowName] = React.useState("");
  const canvasRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (data?.data && data.success) {
      const wf = data.data;
      setWorkflow(wf);
      setWorkflowName(wf.name || "");
      setNodes(wf.nodes || []);
      setConnections(wf.connections || []);
      setHistory([{ nodes: wf.nodes || [], connections: wf.connections || [] }]);
      setHistoryIndex(0);
    }
  }, [data, error]);

  const selectedNode = React.useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const pushHistory = React.useCallback((newNodes: CanvasNode[], newConnections: Connection[]) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, { nodes: newNodes, connections: newConnections }];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = React.useCallback(() => {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setNodes(prev.nodes);
    setConnections(prev.connections);
    setHistoryIndex((prevIdx) => prevIdx - 1);
  }, [history, historyIndex]);

  const redo = React.useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    setNodes(next.nodes);
    setConnections(next.connections);
    setHistoryIndex((prev) => prev + 1);
  }, [history, historyIndex]);

  const addNode = React.useCallback((type: string, category: string) => {
    const cat = NODE_CATEGORIES.find((c) => c.id === category);
    const nodeDef = cat?.nodes.find((n) => n.type === type);
    if (!nodeDef) return;

    const newNode: CanvasNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      label: nodeDef.label,
      category,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      config: {},
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    pushHistory(newNodes, connections);
    setSelectedNodeId(newNode.id);
  }, [nodes, connections, pushHistory]);

  const deleteNode = React.useCallback((nodeId: string) => {
    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const newConnections = connections.filter((c) => c.from !== nodeId && c.to !== nodeId);
    setNodes(newNodes);
    setConnections(newConnections);
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    pushHistory(newNodes, newConnections);
  }, [nodes, connections, selectedNodeId, pushHistory]);

  const updateNodeConfig = React.useCallback((nodeId: string, key: string, value: any) => {
    setNodes((prev) => {
      const updated = prev.map((n) => (n.id === nodeId ? { ...n, config: { ...n.config, [key]: value } } : n));
      return updated;
    });
  }, []);

  const handleCanvasMouseDown = React.useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (connectFrom && connectFrom !== nodeId) {
      const newConn: Connection = { id: `conn-${Date.now()}`, from: connectFrom, to: nodeId };
      const newConnections = [...connections, newConn];
      setConnections(newConnections);
      pushHistory(nodes, newConnections);
      setConnectFrom(null);
      return;
    }

    setSelectedNodeId(nodeId);
    setDraggingNode(nodeId);
    const rect = (e.target as HTMLElement).closest("[data-node]")?.getBoundingClientRect();
    if (rect) {
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, [nodes, connections, connectFrom, pushHistory]);

  const handleCanvasMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!draggingNode || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = (e.clientX - canvasRect.left - dragOffset.x) / zoom;
    const newY = (e.clientY - canvasRect.top - dragOffset.y) / zoom;

    setNodes((prev) => prev.map((n) => (n.id === draggingNode ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n)));
  }, [draggingNode, dragOffset, zoom]);

  const handleCanvasMouseUp = React.useCallback(() => {
    if (draggingNode) {
      pushHistory(nodes, connections);
      setDraggingNode(null);
    }
  }, [draggingNode, nodes, connections, pushHistory]);

  const handleCanvasClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest("[data-canvas-bg]")) {
      setSelectedNodeId(null);
      setConnectFrom(null);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workflowName, nodes, connections }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("workflows.canvas.save", "Save") + "!");
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const response = await fetch(`/api/workflows/${id}/run`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("workflows.canvas.run", "Run") + "!");
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    } finally {
      setRunning(false);
    }
  };

  const getNodeDef = (type: string) => {
    for (const cat of NODE_CATEGORIES) {
      const found = cat.nodes.find((n) => n.type === type);
      if (found) return found;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="size-6 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push("/workflows" as any)}>
            <ArrowLeft className="size-4" />
          </Button>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="h-8 w-64 text-sm font-semibold border-transparent bg-transparent focus:border-border"
            placeholder={t("workflows.workflowName", "Workflow Name")}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={undo} disabled={historyIndex <= 0}>
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
            <ZoomIn className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}>
            <ZoomOut className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setZoom(1)}>
            <Maximize2 className="size-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {t("workflows.canvas.save", "Save")}
          </Button>
          <Button size="sm" onClick={handleRun} disabled={running}>
            {running ? <Loader className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />}
            {t("workflows.canvas.run", "Run")}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 shrink-0 border-r border-border overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t("workflows.canvas.addNode", "Add Node")}</h3>
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="mb-1">
                <button
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  onClick={() => setExpandedCategories((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                >
                  {expandedCategories[cat.id] ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  {t(cat.labelKey, cat.label)}
                </button>
                {expandedCategories[cat.id] && (
                  <div className="ml-3 space-y-0.5">
                    {cat.nodes.map((node) => {
                      const IconComp = node.icon;
                      return (
                        <button
                          key={node.type}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted transition-colors"
                          onClick={() => addNode(node.type, cat.id)}
                        >
                          <div className={`flex size-5 items-center justify-center rounded border ${node.color}`}>
                            <IconComp className="size-3" />
                          </div>
                          <span>{node.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-default"
            style={{ background: "radial-gradient(circle, var(--border) 1px, transparent 1px)", backgroundSize: `${20 * zoom}px ${20 * zoom}px` }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            data-canvas-bg
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0", width: "200%", height: "200%", position: "absolute" }}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {connections.map((conn) => {
                  const fromNode = nodes.find((n) => n.id === conn.from);
                  const toNode = nodes.find((n) => n.id === conn.to);
                  if (!fromNode || !toNode) return null;
                  const x1 = fromNode.x + 100;
                  const y1 = fromNode.y + 30;
                  const x2 = toNode.x;
                  const y2 = toNode.y + 30;
                  const midX = (x1 + x2) / 2;
                  return (
                    <g key={conn.id}>
                      <path
                        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                      />
                      <circle cx={x2} cy={y2} r="4" fill="hsl(var(--primary))" opacity="0.6" />
                    </g>
                  );
                })}
                {connectFrom && (() => {
                  const fromNode = nodes.find((n) => n.id === connectFrom);
                  if (!fromNode) return null;
                  return (
                    <line
                      x1={fromNode.x + 100}
                      y1={fromNode.y + 30}
                      x2={fromNode.x + 200}
                      y2={fromNode.y + 30}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.4"
                    />
                  );
                })()}
              </svg>

              {nodes.map((node) => {
                const nodeDef = getNodeDef(node.type);
                const IconComp = nodeDef?.icon || Settings2;
                const colorClass = nodeDef?.color || "bg-muted text-muted-foreground border-border";
                const isSelected = selectedNodeId === node.id;
                return (
                  <div
                    key={node.id}
                    data-node
                    className={`absolute cursor-move select-none rounded-lg border-2 bg-card shadow-sm transition-shadow ${isSelected ? "border-primary shadow-md" : "border-border hover:shadow-md"}`}
                    style={{ left: node.x, top: node.y, width: 200, zIndex: isSelected ? 10 : 2, }}
                    onMouseDown={(e) => handleCanvasMouseDown(e, node.id)}
                  >
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                      <div className={`flex size-6 items-center justify-center rounded border ${colorClass}`}>
                        <IconComp className="size-3.5" />
                      </div>
                      <span className="text-xs font-medium truncate flex-1">{node.label}</span>
                      <button
                        className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); setConnectFrom(connectFrom === node.id ? null : node.id); }}
                        title="Connect"
                      >
                        <MousePointer2 className="size-3" />
                      </button>
                      <button
                        className="size-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        title={t("workflows.canvas.deleteNode", "Delete Node")}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-[10px] text-muted-foreground capitalize">{node.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-72 shrink-0 border-l border-border overflow-y-auto">
          {selectedNode ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">{t("workflows.canvas.nodeProperties", "Node Properties")}</h3>
                <button className="text-muted-foreground hover:text-foreground" onClick={() => setSelectedNodeId(null)}>
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">{t("workflows.workflowName", "Workflow Name")}</label>
                  <Input
                    value={selectedNode.label}
                    onChange={(e) => {
                      const newNodes = nodes.map((n) => (n.id === selectedNode.id ? { ...n, label: e.target.value } : n));
                      setNodes(newNodes);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Type</label>
                  <div className="flex items-center gap-2">
                    <Badge tone="muted">{selectedNode.type}</Badge>
                  </div>
                </div>
                {(NODE_CONFIG_FIELDS[selectedNode.type] || []).map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-medium mb-1 block">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs resize-none"
                        rows={4}
                        placeholder={field.placeholder}
                        value={selectedNode.config[field.label] || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, field.label, e.target.value)}
                      />
                    ) : field.type === "toggle" ? (
                      <button
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${selectedNode.config[field.label] ? "bg-primary" : "bg-muted"}`}
                        onClick={() => updateNodeConfig(selectedNode.id, field.label, !selectedNode.config[field.label])}
                      >
                        <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${selectedNode.config[field.label] ? "translate-x-4.5" : "translate-x-0.5"}`} />
                      </button>
                    ) : field.type === "select" ? (
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                        value={selectedNode.config[field.label] || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, field.label, e.target.value)}
                      >
                        <option value="">Select...</option>
                      </select>
                    ) : (
                      <Input
                        type={field.type}
                        className="h-8 text-xs"
                        placeholder={field.placeholder}
                        value={selectedNode.config[field.label] || ""}
                        onChange={(e) => updateNodeConfig(selectedNode.id, field.label, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => deleteNode(selectedNode.id)}>
                    <Trash2 className="mr-2 size-3" />
                    {t("workflows.canvas.deleteNode", "Delete Node")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MousePointer2 className="size-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">{t("workflows.canvas.selectNode", "Select a node to edit its properties")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
