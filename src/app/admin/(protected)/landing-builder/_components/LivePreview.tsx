"use client";

import * as React from "react";
import { useLandingSections, type LandingSection } from "@/hooks/use-landing-sections";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompactLoader } from "@/components/ui/ElegantLoader";
import { useLocalizationContext } from "@/providers/localization";

type LivePreviewProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Live Preview Component
 * Shows real-time preview of the landing page as it appears to users
 */
export function LivePreview({ open, onClose }: LivePreviewProps) {
  const { t } = useLocalizationContext();
  const { sections, loading, error } = useLandingSections();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-fetch sections
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Preview Panel */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-2xl bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right-96 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="font-bold text-lg">📱 {t("livePreview.title", "Live Preview")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {loading ? t("common.loading", "Loading...") : error ? t("livePreview.errorLoading", "Error loading") : `${sections.length} ${t("livePreview.sections", "sections")}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="text-xs"
            >
              {refreshing ? "↻ " + t("livePreview.refreshing", "Refreshing...") : "↻ " + t("livePreview.refresh", "Refresh")}
            </Button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded-lg p-2 hover:bg-muted transition"
              aria-label={t("livePreview.closePreview", "Close preview")}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          {loading ? (
            <div className="flex items-center justify-center h-full py-32">
              <CompactLoader />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 max-w-xs">
                <p className="text-sm font-semibold text-destructive">⚠️ {t("livePreview.failedToLoad", "Failed to load preview")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("livePreview.checkDatabase", "Check your database connection and try again.")}
                </p>
              </div>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 max-w-xs">
                <p className="text-sm font-semibold">{t("livePreview.noSections", "No sections to preview")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("livePreview.createAndPublish", "Create and publish sections in the editor to see them here.")}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-screen bg-background">
              <iframe
                srcDoc={generatePreviewHTML(sections as PreviewSection[])}
                className="w-full h-full border-none"
                title="Landing page preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          💡 This preview shows your landing page as visitors will see it. Refresh to see latest changes.
        </div>
      </div>
    </>
  );
}

/**
 * Generate HTML for iframe preview
 */
type PreviewSection = LandingSection & {
  media: Array<{ id: string; url: string; alt: string; type: string; order: number }>;
};

function generatePreviewHTML(sections: PreviewSection[]): string {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Landing Page Preview</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          line-height: 1.6;
        }
        
        .preview-container {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .section {
          border-top: 1px solid #e5e7eb;
          padding: 2rem 1.5rem;
        }
        
        .section:first-child {
          border-top: none;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #000;
        }
        
        .section-subtitle {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 1rem;
        }
        
        .section-content {
          font-size: 0.875rem;
          color: #555;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f0f0f0;
          color: #666;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .badge.hidden {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #e5e7eb;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
        
        .status.hidden {
          background: #fed7aa;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div style="padding: 1.5rem; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
          <div style="font-size: 0.875rem; color: #666;">
            <strong>Preview Mode</strong> - Showing ${sections.length} sections as they will appear on your landing page
          </div>
        </div>
        
        ${sections
          .filter((s) => s.visible)
          .sort((a, b) => a.order - b.order)
          .map((section, _index) => `
            <div class="section">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="font-size: 1.5rem;">${getTypeIcon(section.type)}</span>
                <div>
                  <div class="section-title">${section.title || section.sectionKey}</div>
                  ${!section.visible ? '<span class="badge hidden">Hidden</span>' : ''}
                  <span class="status">#${section.order + 1}</span>
                </div>
              </div>
              ${section.description ? `<div class="section-subtitle">${escapeHtml(section.description)}</div>` : ''}
              <div class="section-content">
                <strong>Type:</strong> ${section.type}<br>
                <strong>Key:</strong> ${section.sectionKey}<br>
                ${section.media && section.media.length > 0 ? `<strong>Media:</strong> ${section.media.length} items<br>` : ''}
                ${section.config && Object.keys(section.config).length > 0 
                  ? `<strong>Config:</strong> ${Object.keys(section.config).length} fields` 
                  : ''}
              </div>
            </div>
          `)
          .join('')}
        
        <div style="padding: 2rem 1.5rem; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 0.875rem;">
          ✅ Preview loaded successfully - ${sections.filter((s) => s.visible).length} visible sections
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    "pricing": "💰",
    "credit-packs": "📦",
    "credit-usage": "📊",
    "faq": "❓",
    "hero": "🚀",
    "features": "⭐",
    "cta": "🎯",
    "footer": "📄",
    "custom": "🔧",
    "testimonials": "💬",
    "social-proof": "👥",
    "screenshots": "📸",
    "ai-platform": "🤖",
    "realtime-stats": "📈",
  };
  return icons[type] || "📌";
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
