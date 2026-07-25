"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
};

export function Sheet({ open, onClose, children, side = "right", className }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses: Record<string, string> = {
    right: "right-0 top-0 h-full w-full max-w-2xl animate-in slide-in-from-right duration-300",
    left: "left-0 top-0 h-full w-full max-w-2xl animate-in slide-in-from-left duration-300",
    top: "top-0 left-0 w-full h-full max-h-[90vh] animate-in slide-in-from-top duration-300",
    bottom: "bottom-0 left-0 w-full h-full max-h-[90vh] animate-in slide-in-from-bottom duration-300",
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-50 flex flex-col border-l border-border bg-card shadow-2xl",
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

type SheetContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function SheetContent({ children, className }: SheetContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

type SheetHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function SheetHeader({ children, className }: SheetHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3 p-4 border-b border-border bg-muted/30", className)}>
      {children}
    </div>
  );
}

type SheetTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export function SheetTitle({ children, className }: SheetTitleProps) {
  return (
    <h2 className={cn("text-lg font-bold", className)}>
      {children}
    </h2>
  );
}

type SheetCloseButtonProps = {
  onClick: () => void;
  className?: string;
};

export function SheetCloseButton({ onClick, className }: SheetCloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn("text-muted-foreground hover:text-foreground rounded-lg p-2 hover:bg-muted transition", className)}
      aria-label="Close"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
