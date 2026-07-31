"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  Image,
  Minus,
  Columns,
  LayoutTemplate,
  MousePointerClick,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  GripVertical,
  Square,
  CreditCard,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { cn } from "@/lib/utils";

type BlockType =
  | "header"
  | "banner"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "columns"
  | "footer"
  | "social";

type BuilderBlock = {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
};

type EmailBuilderProps = {
  blocks: BuilderBlock[];
  onChange: (blocks: BuilderBlock[]) => void;
  previewMode?: boolean;
  sampleVariables?: Record<string, string>;
};

type BlockDef = {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  defaults: Record<string, unknown>;
};

const BLOCK_DEFS: BlockDef[] = [
  {
    type: "header",
    label: "Header",
    icon: <LayoutTemplate size={16} />,
    defaults: { title: "Your Title", subtitle: "Subtitle text", bgColor: "#ffffff", padding: 40, alignment: "center" },
  },
  {
    type: "banner",
    label: "Banner",
    icon: <Image size={16} />,
    defaults: { src: "", alt: "Banner image", bgColor: "#f1f5f9", padding: 0, width: "100%" },
  },
  {
    type: "text",
    label: "Text",
    icon: <Type size={16} />,
    defaults: { text: "Enter your text here. Use {{variable}} for placeholders.", fontSize: 16, color: "#334155", bgColor: "#ffffff", padding: 16, alignment: "left", lineHeight: 1.6 },
  },
  {
    type: "image",
    label: "Image",
    icon: <CreditCard size={16} />,
    defaults: { src: "", alt: "Image description", bgColor: "#ffffff", padding: 16, alignment: "center", width: "100%" },
  },
  {
    type: "button",
    label: "Button",
    icon: <MousePointerClick size={16} />,
    defaults: { text: "Click Here", url: "#", bgColor: "#6366f1", textColor: "#ffffff", borderRadius: 12, padding: 16, alignment: "center", fontSize: 16 },
  },
  {
    type: "divider",
    label: "Divider",
    icon: <Minus size={16} />,
    defaults: { color: "#e2e8f0", thickness: 1, bgColor: "#ffffff", padding: 16, style: "solid" },
  },
  {
    type: "columns",
    label: "Columns",
    icon: <Columns size={16} />,
    defaults: { leftText: "Left column content", rightText: "Right column content", bgColor: "#ffffff", padding: 16, gap: 16 },
  },
  {
    type: "footer",
    label: "Footer",
    icon: <AlignLeft size={16} />,
    defaults: {
      companyName: "Tamer Studio",
      address: "123 Main St, City, Country",
      links: [
        { text: "Unsubscribe", url: "#unsubscribe" },
        { text: "Privacy Policy", url: "#privacy" },
      ],
      bgColor: "#f8fafc",
      padding: 32,
      textColor: "#64748b",
      alignment: "center",
    },
  },
  {
    type: "social",
    label: "Social",
    icon: <Globe size={16} />,
    defaults: {
      platforms: [
        { name: "Twitter", url: "https://twitter.com" },
        { name: "Facebook", url: "https://facebook.com" },
        { name: "LinkedIn", url: "https://linkedin.com" },
      ],
      bgColor: "#ffffff",
      padding: 16,
      alignment: "center",
      iconSize: 24,
    },
  },
];

function createBlock(type: BlockType): BuilderBlock {
  const def = BLOCK_DEFS.find((b) => b.type === type)!;
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content: { ...def.defaults },
  };
}

function replaceVariables(text: string, variables?: Record<string, string>): string {
  if (!variables || typeof text !== "string") return text;
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
}

function blocksToHtml(blocks: BuilderBlock[], sampleVariables?: Record<string, string>): string {
  const inner = blocks.map((block) => renderBlock(block, sampleVariables)).join("\n");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;">
${inner}
</div>
</body>
</html>`;
}

function renderBlock(block: BuilderBlock, vars?: Record<string, string>): string {
  const c = block.content;
  const p = c.padding ?? 16;

  switch (block.type) {
    case "header": {
      const title = replaceVariables(String(c.title ?? ""), vars);
      const subtitle = replaceVariables(String(c.subtitle ?? ""), vars);
      const bg = String(c.bgColor ?? "#ffffff");
      const align = String(c.alignment ?? "center");
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:${escapeAttr(align)};"><h1 style="margin:0;font-size:28px;font-weight:700;color:#1a1a2e;">${escapeHtml(title)}</h1>${subtitle ? `<p style="margin:8px 0 0 0;font-size:16px;color:#64748b;">${escapeHtml(subtitle)}</p>` : ""}</div>`;
    }
    case "banner": {
      const src = replaceVariables(String(c.src ?? ""), vars);
      const alt = String(c.alt ?? "");
      const bg = String(c.bgColor ?? "#f1f5f9");
      if (!src) return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:center;"><div style="background:#e2e8f0;height:200px;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#94a3b8;">Banner Image</div></div>`;
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" style="width:100%;display:block;" /></div>`;
    }
    case "text": {
      const text = replaceVariables(String(c.text ?? ""), vars);
      const bg = String(c.bgColor ?? "#ffffff");
      const align = String(c.alignment ?? "left");
      const fontSize = c.fontSize ?? 16;
      const color = String(c.color ?? "#334155");
      const lineHeight = c.lineHeight ?? 1.6;
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:${escapeAttr(align)};"><p style="margin:0;font-size:${fontSize}px;color:${escapeAttr(color)};line-height:${lineHeight};">${escapeHtml(text)}</p></div>`;
    }
    case "image": {
      const src = replaceVariables(String(c.src ?? ""), vars);
      const alt = String(c.alt ?? "");
      const bg = String(c.bgColor ?? "#ffffff");
      const align = String(c.alignment ?? "center");
      if (!src) return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:${escapeAttr(align)};"><div style="background:#e2e8f0;height:160px;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#94a3b8;">Image</div></div>`;
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:${escapeAttr(align)};"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" style="max-width:100%;display:inline-block;" /></div>`;
    }
    case "button": {
      const text = replaceVariables(String(c.text ?? ""), vars);
      const url = replaceVariables(String(c.url ?? "#"), vars);
      const btnBg = String(c.bgColor ?? "#6366f1");
      const btnColor = String(c.textColor ?? "#ffffff");
      const radius = c.borderRadius ?? 12;
      const align = String(c.alignment ?? "center");
      const fontSize = c.fontSize ?? 16;
      return `<div style="background:transparent;padding:${p}px;text-align:${escapeAttr(align)};"><a href="${escapeAttr(url)}" style="display:inline-block;background:${escapeAttr(btnBg)};color:${escapeAttr(btnColor)};text-decoration:none;padding:14px 32px;border-radius:${radius}px;font-size:${fontSize}px;font-weight:600;">${escapeHtml(text)}</a></div>`;
    }
    case "divider": {
      const lineColor = String(c.color ?? "#e2e8f0");
      const thickness = c.thickness ?? 1;
      const bg = String(c.bgColor ?? "#ffffff");
      const style = String(c.style ?? "solid");
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;"><hr style="border:none;border-top:${thickness}px ${style} ${escapeAttr(lineColor)};margin:0;" /></div>`;
    }
    case "columns": {
      const left = replaceVariables(String(c.leftText ?? ""), vars);
      const right = replaceVariables(String(c.rightText ?? ""), vars);
      const bg = String(c.bgColor ?? "#ffffff");
      const gap = Number(c.gap ?? 16);
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:50%;padding-right:${gap / 2}px;vertical-align:top;font-size:14px;color:#334155;line-height:1.6;">${escapeHtml(left)}</td><td style="width:50%;padding-left:${gap / 2}px;vertical-align:top;font-size:14px;color:#334155;line-height:1.6;">${escapeHtml(right)}</td></tr></table></div>`;
    }
    case "footer": {
      const companyName = replaceVariables(String(c.companyName ?? ""), vars);
      const address = String(c.address ?? "");
      const links = Array.isArray(c.links) ? (c.links as Array<{ text: string; url: string }>) : [];
      const bg = String(c.bgColor ?? "#f8fafc");
      const align = String(c.alignment ?? "center");
      const textColor = String(c.textColor ?? "#64748b");
      const linksHtml = links.map((l) => `<a href="${escapeAttr(l.url)}" style="color:${escapeAttr(textColor)};text-decoration:underline;margin:0 8px;">${escapeHtml(l.text)}</a>`).join(" | ");
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:${escapeAttr(align)};"><p style="margin:0 0 8px 0;font-size:12px;color:${escapeAttr(textColor)};">${escapeHtml(companyName)}${address ? ` &bull; ${escapeHtml(address)}` : ""}</p><p style="margin:0;font-size:12px;color:${escapeAttr(textColor)};">${linksHtml}</p></div>`;
    }
    case "social": {
      const platforms = Array.isArray(c.platforms) ? (c.platforms as Array<{ name: string; url: string }>) : [];
      const bg = String(c.bgColor ?? "#ffffff");
      const align = String(c.alignment ?? "center");
      const iconSize = c.iconSize ?? 24;
      const socialHtml = platforms.map((s) => `<a href="${escapeAttr(s.url)}" style="display:inline-block;margin:0 8px;color:#6366f1;text-decoration:none;font-size:${iconSize}px;font-weight:600;">${escapeHtml(s.name)}</a>`).join("");
      return `<div style="background:${escapeAttr(bg)};padding:${p}px;text-align:${escapeAttr(align)};">${socialHtml}</div>`;
    }
  }
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  previewMode,
  variables,
}: {
  block: BuilderBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  previewMode: boolean;
  variables?: Record<string, string>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockDef = BLOCK_DEFS.find((b) => b.type === block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border transition-all",
        isDragging && "opacity-50 z-50",
        isSelected && !previewMode ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-border/80",
        previewMode ? "cursor-default" : "cursor-pointer"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!previewMode && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="cursor-grab active:cursor-grabbing rounded bg-background border border-border p-0.5 shadow-sm hover:bg-muted"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {!previewMode && isSelected && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded bg-destructive/10 border border-destructive/20 p-0.5 shadow-sm hover:bg-destructive/20 text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <div className="p-3">
        {!previewMode && (
          <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {blockDef?.icon}
            {blockDef?.label}
          </div>
        )}
        <BlockPreview block={block} variables={variables} />
      </div>
    </div>
  );
}

function BlockPreview({ block, variables }: { block: BuilderBlock; variables?: Record<string, string> }) {
  const c = block.content;

  switch (block.type) {
    case "header": {
      const title = replaceVariables(String(c.title ?? ""), variables);
      const subtitle = replaceVariables(String(c.subtitle ?? ""), variables);
      return (
        <div className="text-center py-2">
          <div className="text-lg font-bold text-foreground">{title}</div>
          {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
        </div>
      );
    }
    case "banner": {
      const src = replaceVariables(String(c.src ?? ""), variables);
      return (
        <div className="rounded overflow-hidden bg-muted/50 h-24 flex items-center justify-center">
          {src ? <img src={src} alt={String(c.alt ?? "")} className="w-full h-full object-cover" /> : <span className="text-muted-foreground text-sm">Banner Image</span>}
        </div>
      );
    }
    case "text": {
      const text = replaceVariables(String(c.text ?? ""), variables);
      return <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{text}</p>;
    }
    case "image": {
      const src = replaceVariables(String(c.src ?? ""), variables);
      return (
        <div className="rounded overflow-hidden bg-muted/50 h-20 flex items-center justify-center">
          {src ? <img src={src} alt={String(c.alt ?? "")} className="max-h-full object-contain" /> : <span className="text-muted-foreground text-sm">Image</span>}
        </div>
      );
    }
    case "button": {
      const text = replaceVariables(String(c.text ?? ""), variables);
      return (
        <div className="text-center py-2">
          <span className="inline-block px-6 py-2 rounded-lg text-sm font-semibold" style={{ background: String(c.bgColor ?? "#6366f1"), color: String(c.textColor ?? "#ffffff"), borderRadius: `${c.borderRadius ?? 12}px` }}>
            {text}
          </span>
        </div>
      );
    }
    case "divider": {
      return <hr className="border-0 my-2" style={{ borderTop: `${c.thickness ?? 1}px ${c.style ?? "solid"} ${c.color ?? "#e2e8f0"}` }} />;
    }
    case "columns": {
      const left = replaceVariables(String(c.leftText ?? ""), variables);
      const right = replaceVariables(String(c.rightText ?? ""), variables);
      return (
        <div className="grid grid-cols-2 gap-2 text-sm text-foreground/80">
          <div className="p-2 rounded bg-muted/30">{left}</div>
          <div className="p-2 rounded bg-muted/30">{right}</div>
        </div>
      );
    }
    case "footer": {
      const companyName = replaceVariables(String(c.companyName ?? ""), variables);
      const links = Array.isArray(c.links) ? (c.links as Array<{ text: string; url: string }>) : [];
      return (
        <div className="text-center text-xs text-muted-foreground py-2">
          <div className="font-medium">{companyName}</div>
          <div className="mt-1">
            {links.map((l, i) => (
              <span key={i}>
                {i > 0 && " | "}
                <span className="underline">{l.text}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }
    case "social": {
      const platforms = Array.isArray(c.platforms) ? (c.platforms as Array<{ name: string; url: string }>) : [];
      return (
        <div className="flex justify-center gap-3">
          {platforms.map((s, i) => (
            <span key={i} className="text-sm font-semibold text-primary underline">{s.name}</span>
          ))}
        </div>
      );
    }
  }
}

function PropertiesPanel({
  block,
  onUpdate,
}: {
  block: BuilderBlock;
  onUpdate: (content: Record<string, unknown>) => void;
}) {
  const c = block.content;

  function update(key: string, value: unknown) {
    onUpdate({ ...c, [key]: value });
  }

  return (
    <DashboardCard title="Block Properties" description={BLOCK_DEFS.find((b) => b.type === block.type)?.label}>
      <div className="space-y-3">
        <div>
          <Label>Background Color</Label>
          <div className="flex gap-2 items-center mt-1">
            <input type="color" value={String(c.bgColor ?? "#ffffff")} onChange={(e) => update("bgColor", e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
            <Input value={String(c.bgColor ?? "#ffffff")} onChange={(e) => update("bgColor", e.target.value)} className="h-7 text-xs" />
          </div>
        </div>

        <div>
          <Label>Padding (px)</Label>
          <Input type="number" value={Number(c.padding ?? 16)} onChange={(e) => update("padding", Number(e.target.value))} className="h-7 text-xs mt-1" />
        </div>

        {"alignment" in c && (
          <div>
            <Label>Alignment</Label>
            <div className="flex gap-1 mt-1">
              {(["left", "center", "right"] as const).map((align) => (
                <Button key={align} size="icon-xs" variant={c.alignment === align ? "default" : "outline"} onClick={() => update("alignment", align)}>
                  {align === "left" && <AlignLeft size={14} />}
                  {align === "center" && <AlignCenter size={14} />}
                  {align === "right" && <AlignRight size={14} />}
                </Button>
              ))}
            </div>
          </div>
        )}

        {block.type === "header" && (
          <>
            <div>
              <Label>Title</Label>
              <Input value={String(c.title ?? "")} onChange={(e) => update("title", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input value={String(c.subtitle ?? "")} onChange={(e) => update("subtitle", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
          </>
        )}

        {block.type === "banner" && (
          <>
            <div>
              <Label>Image URL</Label>
              <Input value={String(c.src ?? "")} onChange={(e) => update("src", e.target.value)} className="h-7 text-xs mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input value={String(c.alt ?? "")} onChange={(e) => update("alt", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
          </>
        )}

        {block.type === "text" && (
          <>
            <div>
              <Label>Text Content</Label>
              <textarea
                value={String(c.text ?? "")}
                onChange={(e) => update("text", e.target.value)}
                className="w-full mt-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-h-[80px] resize-y"
                rows={4}
              />
            </div>
            <div>
              <Label>Font Size (px)</Label>
              <Input type="number" value={Number(c.fontSize ?? 16)} onChange={(e) => update("fontSize", Number(e.target.value))} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={String(c.color ?? "#334155")} onChange={(e) => update("color", e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={String(c.color ?? "#334155")} onChange={(e) => update("color", e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
          </>
        )}

        {block.type === "image" && (
          <>
            <div>
              <Label>Image URL</Label>
              <Input value={String(c.src ?? "")} onChange={(e) => update("src", e.target.value)} className="h-7 text-xs mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input value={String(c.alt ?? "")} onChange={(e) => update("alt", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
          </>
        )}

        {block.type === "button" && (
          <>
            <div>
              <Label>Button Text</Label>
              <Input value={String(c.text ?? "")} onChange={(e) => update("text", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Link URL</Label>
              <Input value={String(c.url ?? "")} onChange={(e) => update("url", e.target.value)} className="h-7 text-xs mt-1" placeholder="https://..." />
            </div>
            <div>
              <Label>Button Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={String(c.bgColor ?? "#6366f1")} onChange={(e) => update("bgColor", e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={String(c.bgColor ?? "#6366f1")} onChange={(e) => update("bgColor", e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={String(c.textColor ?? "#ffffff")} onChange={(e) => update("textColor", e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={String(c.textColor ?? "#ffffff")} onChange={(e) => update("textColor", e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
            <div>
              <Label>Border Radius (px)</Label>
              <Input type="number" value={Number(c.borderRadius ?? 12)} onChange={(e) => update("borderRadius", Number(e.target.value))} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Font Size (px)</Label>
              <Input type="number" value={Number(c.fontSize ?? 16)} onChange={(e) => update("fontSize", Number(e.target.value))} className="h-7 text-xs mt-1" />
            </div>
          </>
        )}

        {block.type === "divider" && (
          <>
            <div>
              <Label>Line Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={String(c.color ?? "#e2e8f0")} onChange={(e) => update("color", e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={String(c.color ?? "#e2e8f0")} onChange={(e) => update("color", e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
            <div>
              <Label>Thickness (px)</Label>
              <Input type="number" value={Number(c.thickness ?? 1)} onChange={(e) => update("thickness", Number(e.target.value))} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Style</Label>
              <select
                value={String(c.style ?? "solid")}
                onChange={(e) => update("style", e.target.value)}
                className="w-full h-7 mt-1 rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}

        {block.type === "columns" && (
          <>
            <div>
              <Label>Left Column</Label>
              <textarea
                value={String(c.leftText ?? "")}
                onChange={(e) => update("leftText", e.target.value)}
                className="w-full mt-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-h-[60px] resize-y"
                rows={3}
              />
            </div>
            <div>
              <Label>Right Column</Label>
              <textarea
                value={String(c.rightText ?? "")}
                onChange={(e) => update("rightText", e.target.value)}
                className="w-full mt-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 min-h-[60px] resize-y"
                rows={3}
              />
            </div>
          </>
        )}

        {block.type === "footer" && (
          <>
            <div>
              <Label>Company Name</Label>
              <Input value={String(c.companyName ?? "")} onChange={(e) => update("companyName", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={String(c.address ?? "")} onChange={(e) => update("address", e.target.value)} className="h-7 text-xs mt-1" />
            </div>
            <div>
              <Label>Text Color</Label>
              <div className="flex gap-2 items-center mt-1">
                <input type="color" value={String(c.textColor ?? "#64748b")} onChange={(e) => update("textColor", e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <Input value={String(c.textColor ?? "#64748b")} onChange={(e) => update("textColor", e.target.value)} className="h-7 text-xs" />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardCard>
  );
}

function DragOverlayContent({ block }: { block: BuilderBlock }) {
  const def = BLOCK_DEFS.find((b) => b.type === block.type);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary bg-background p-3 shadow-lg opacity-90 w-64">
      {def?.icon}
      <span className="text-sm font-medium">{def?.label}</span>
    </div>
  );
}

export function EmailBuilder({ blocks, onChange, previewMode = false, sampleVariables }: EmailBuilderProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const blockIds = React.useMemo(() => blocks.map((b) => b.id), [blocks]);
  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  function handleCanvasClick() {
    setSelectedId(null);
  }

  function handleAddBlock(type: BlockType) {
    const newBlock = createBlock(type);
    onChange([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  }

  function handleDeleteBlock(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleUpdateBlock(id: string, content: Record<string, unknown>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  }

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  if (previewMode) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-muted/30 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Email Preview
        </div>
        <div className="bg-background">
          {blocks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No blocks to preview</div>
          ) : (
            blocks.map((block) => (
              <div key={block.id}>
                <BlockPreview block={block} variables={sampleVariables} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const activeOverlay = activeBlock ? <DragOverlayContent block={activeBlock} /> : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full min-h-[600px]">
        <div className="w-48 shrink-0 space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-2">Blocks</div>
          {BLOCK_DEFS.map((def) => (
            <button
              key={def.type}
              onClick={() => handleAddBlock(def.type)}
              className="w-full flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted/50 hover:border-border/80 transition-all text-left"
            >
              {def.icon}
              {def.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 min-h-[400px] rounded-xl border-2 border-dashed border-border/50 p-4" onClick={handleCanvasClick}>
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Square size={32} className="mb-3 opacity-40" />
                  <p className="text-sm">Drag blocks here or click to add</p>
                </div>
              ) : (
                blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedId === block.id}
                    onSelect={() => setSelectedId(block.id)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    previewMode={previewMode}
                    variables={sampleVariables}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </div>

        <DragOverlay>{activeOverlay}</DragOverlay>

        <div className="w-64 shrink-0">
          {selectedBlock ? (
            <PropertiesPanel block={selectedBlock} onUpdate={(content) => handleUpdateBlock(selectedBlock.id, content)} />
          ) : (
            <DashboardCard title="Properties">
              <p className="text-xs text-muted-foreground">Select a block to edit its properties</p>
            </DashboardCard>
          )}
        </div>
      </div>
    </DndContext>
  );
}

export { blocksToHtml, createBlock, replaceVariables };
export type { BuilderBlock, BlockType, EmailBuilderProps };
