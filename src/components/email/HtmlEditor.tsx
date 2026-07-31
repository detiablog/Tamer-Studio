"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Link,
  Image,
  Table,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Type,
  Heading1,
  List,
  ListOrdered,
  Code,
  Minus,
} from "lucide-react";

type HtmlEditorProps = {
  html: string;
  text?: string;
  onChange: (html: string) => void;
  onTextChange?: (text: string) => void;
  variables?: string[];
  sampleVariables?: Record<string, string>;
  height?: number;
};

type PreviewSize = "desktop" | "tablet" | "mobile";

const PREVIEW_WIDTHS: Record<PreviewSize, number> = {
  desktop: 600,
  tablet: 480,
  mobile: 320,
};

function insertTag(textarea: HTMLTextAreaElement, before: string, after: string, defaultText?: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = selected || defaultText || "";
  const newText = textarea.value.substring(0, start) + before + replacement + after + textarea.value.substring(end);
  return { newText, cursorStart: start + before.length, cursorEnd: start + before.length + replacement.length };
}

function highlightVariables(text: string): React.ReactNode[] {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (/^\{\{[^}]+\}\}$/.test(part)) {
      return (
        <span key={i} className="text-primary font-semibold bg-primary/10 rounded px-0.5">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function replaceSampleVariables(html: string, sampleVariables?: Record<string, string>): string {
  if (!sampleVariables) return html;
  let result = html;
  for (const [key, value] of Object.entries(sampleVariables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

function PreviewFrame({ html, width, darkMode, sampleVariables, height }: { html: string; width: number; darkMode: boolean; sampleVariables?: Record<string, string>; height: number }) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const rendered = replaceSampleVariables(html, sampleVariables);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const bgColor = darkMode ? "#1a1a2e" : "#f1f5f9";
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 16px; background: ${bgColor}; font-family: Arial, sans-serif; }
  img { max-width: 100%; height: auto; }
  a { color: #6366f1; }
</style>
</head>
<body>
${rendered}
</body>
</html>`);
    doc.close();
  }, [rendered, darkMode]);

  return (
    <div className="overflow-auto rounded-lg border border-border bg-white" style={{ height }}>
      <div className="flex justify-center">
        <iframe
          ref={iframeRef}
          title="Email Preview"
          style={{ width, height, border: "none" }}
          className="bg-white"
        />
      </div>
    </div>
  );
}

export function HtmlEditor({ html, text, onChange, onTextChange, variables, sampleVariables, height = 600 }: HtmlEditorProps) {
  const [previewSize, setPreviewSize] = React.useState<PreviewSize>("desktop");
  const [darkMode, setDarkMode] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"html" | "text">("html");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const wordCount = (activeTab === "html" ? html : text || "").trim().split(/\s+/).filter(Boolean).length;
  const charCount = (activeTab === "html" ? html : text || "").length;

  function handleInsert(before: string, after: string, defaultText?: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const result = insertTag(textarea, before, after, defaultText);
    if (activeTab === "html") {
      onChange(result.newText);
    } else {
      onTextChange?.(result.newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
    }, 0);
  }

  const toolbarButtons = [
    { icon: <Bold size={14} />, label: "Bold", before: "<b>", after: "</b>", defaultText: "bold text" },
    { icon: <Italic size={14} />, label: "Italic", before: "<i>", after: "</i>", defaultText: "italic text" },
    { icon: <Heading1 size={14} />, label: "Heading", before: "<h2>", after: "</h2>", defaultText: "Heading" },
    { icon: <Link size={14} />, label: "Link", before: '<a href="', after: '">link text</a>', defaultText: "https://example.com" },
    { icon: <Image size={14} />, label: "Image", before: '<img src="', after: '" alt="description" />', defaultText: "https://example.com/image.jpg" },
    { icon: <Table size={14} />, label: "Table", before: "<table><tr><td>", after: "</td></tr></table>", defaultText: "cell" },
    { icon: <List size={14} />, label: "Unordered List", before: "<ul><li>", after: "</li></ul>", defaultText: "list item" },
    { icon: <ListOrdered size={14} />, label: "Ordered List", before: "<ol><li>", after: "</li></ol>", defaultText: "list item" },
    { icon: <Code size={14} />, label: "Code", before: "<code>", after: "</code>", defaultText: "code" },
    { icon: <Minus size={14} />, label: "Divider", before: "<hr />", after: "" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          <Button
            size="xs"
            variant={activeTab === "html" ? "default" : "ghost"}
            onClick={() => setActiveTab("html")}
          >
            HTML
          </Button>
          <Button
            size="xs"
            variant={activeTab === "text" ? "default" : "ghost"}
            onClick={() => setActiveTab("text")}
            disabled={!onTextChange}
          >
            Plain Text
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-muted/50 rounded-lg p-0.5">
            {([
              { size: "desktop" as const, icon: <Monitor size={14} />, label: "Desktop" },
              { size: "tablet" as const, icon: <Tablet size={14} />, label: "Tablet" },
              { size: "mobile" as const, icon: <Smartphone size={14} />, label: "Mobile" },
            ]).map((opt) => (
              <Button
                key={opt.size}
                size="icon-xs"
                variant={previewSize === opt.size ? "default" : "ghost"}
                onClick={() => setPreviewSize(opt.size)}
                title={opt.label}
              >
                {opt.icon}
              </Button>
            ))}
          </div>

          <Button size="icon-xs" variant={darkMode ? "default" : "ghost"} onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </Button>
        </div>
      </div>

      {activeTab === "html" && (
        <div className="flex flex-wrap gap-0.5 border border-border rounded-lg p-1.5 bg-muted/20">
          {toolbarButtons.map((btn) => (
            <Button
              key={btn.label}
              size="icon-xs"
              variant="ghost"
              onClick={() => handleInsert(btn.before, btn.after, btn.defaultText)}
              title={btn.label}
            >
              {btn.icon}
            </Button>
          ))}
          {variables && variables.length > 0 && (
            <>
              <div className="w-px bg-border mx-1" />
              <div className="flex items-center gap-1">
                <Type size={12} className="text-muted-foreground" />
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleInsert("", "", `{{${e.target.value}}}`);
                      e.target.value = "";
                    }
                  }}
                  className="h-6 text-xs bg-transparent border border-border rounded px-1 outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Insert Variable
                  </option>
                  {variables.map((v) => (
                    <option key={v} value={v}>
                      {`{{${v}}}`}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <DashboardCard>
            <div className="relative flex-1 min-h-0 h-[400px]">
              <div className="absolute inset-0 overflow-auto font-mono text-xs leading-relaxed pointer-events-none">
                <pre className="p-2.5 whitespace-pre-wrap break-words invisible" aria-hidden>
                  {highlightVariables(activeTab === "html" ? html : text || "")}
                </pre>
              </div>
              <textarea
                ref={textareaRef}
                value={activeTab === "html" ? html : text || ""}
                onChange={(e) => (activeTab === "html" ? onChange(e.target.value) : onTextChange?.(e.target.value))}
                className={cn(
                  "w-full h-full min-h-[400px] p-2.5 font-mono text-xs leading-relaxed bg-transparent border-0 outline-none resize-none relative z-10 caret-foreground",
                  "text-transparent selection:bg-primary/20"
                )}
                spellCheck={false}
                style={{ color: "rgba(0,0,0,0)" }}
              />
            </div>
            <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          </DashboardCard>
        </div>

        <div className="flex-1 min-h-0">
          <PreviewFrame html={html} width={PREVIEW_WIDTHS[previewSize]} darkMode={darkMode} sampleVariables={sampleVariables} height={height} />
        </div>
      </div>
    </div>
  );
}
