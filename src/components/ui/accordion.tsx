"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string[];
  children: React.ReactNode;
  className?: string;
}

function Accordion({ type = "single", defaultValue = [], children, className }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set(defaultValue));

  const toggle = (value: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(value)) { next.delete(value); }
      else if (type === "single") { next.clear(); next.add(value); }
      else { next.add(value); }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div data-slot="accordion" className={cn("w-full", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

const AccordionContext = React.createContext<{
  openItems: Set<string>; toggle: (v: string) => void;
}>({ openItems: new Set(), toggle: () => {} });

function useAccordion() { return React.useContext(AccordionContext); }

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <div data-slot="accordion-item" className={cn("border-b", className)} {...props}>
      <AccordionContext.Provider value={React.useContext(AccordionContext)}>{children}</AccordionContext.Provider>
    </div>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function AccordionTrigger({ value, className, children, ...props }: AccordionTriggerProps) {
  const { openItems, toggle } = useAccordion();
  const isOpen = openItems.has(value);
  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left",
        className
      )}
      onClick={() => toggle(value)}
      aria-expanded={isOpen}
      {...props}
    >
      {children}
      <span className={cn("shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}>▾</span>
    </button>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionContent({ value, className, children, ...props }: AccordionContentProps) {
  const { openItems } = useAccordion();
  if (!openItems.has(value)) return null;
  return (
    <div
      data-slot="accordion-content"
      className={cn("overflow-hidden text-sm animate-in slide-in-from-top-1 duration-200", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
