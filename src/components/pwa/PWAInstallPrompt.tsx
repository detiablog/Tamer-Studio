"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Download className="size-5 text-primary" />
            <span className="font-medium text-sm">Install Tamer Studio</span>
          </div>
          <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Install the app for a faster, offline-capable experience.</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleInstall} className="flex-1">Install</Button>
          <Button size="sm" variant="ghost" onClick={() => setShow(false)}>Later</Button>
        </div>
      </div>
    </div>
  );
}
