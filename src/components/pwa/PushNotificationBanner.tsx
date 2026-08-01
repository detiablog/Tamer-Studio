"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";

export function PushNotificationBanner() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const dismissed = localStorage.getItem("pwa-notif-dismissed");
      if (!dismissed) setShow(true);
    }
  }, []);

  const handleEnable = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-notif-dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-primary" />
            <span className="font-medium text-sm">Enable Notifications</span>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Get notified about generation progress, completions, and important updates.</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleEnable} className="flex-1">Enable</Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>Not Now</Button>
        </div>
      </div>
    </div>
  );
}
