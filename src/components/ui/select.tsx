"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Select({ value, onValueChange, children, className }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value ?? "");

  React.useEffect(() => { if (value !== undefined) setSelectedValue(value); }, [value]);

  const handleChange = (v: string) => {
    setSelectedValue(v);
    onValueChange?.(v);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: selectedValue, onChange: handleChange, isOpen, setIsOpen }}>
      <div className={cn("relative", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

const SelectContext = React.createContext<{
  value: string; onChange: (v: string) => void; isOpen: boolean; setIsOpen: (v: boolean) => void;
}>({ value: "", onChange: () => {}, isOpen: false, setIsOpen: () => {} });

function useSelect() { return React.useContext(SelectContext); }

function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isOpen, setIsOpen } = useSelect();
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <span className="ml-2 text-muted-foreground">▾</span>
    </button>
  );
}

function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSelect();
  if (!isOpen) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectItem({ value, className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: selectedValue, onChange } = useSelect();
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        selectedValue === value && "bg-accent text-accent-foreground font-medium",
        className
      )}
      onClick={() => onChange(value)}
      {...props}
    >
      {children}
    </div>
  );
}

function SelectPlaceholder({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { value } = useSelect();
  if (value) return null;
  return <span className={cn("text-muted-foreground", className)} {...props}>{children}</span>;
}

function SelectValue({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { value } = useSelect();
  if (!value) return null;
  return <span className={cn("truncate", className)} {...props}>{children ?? value}</span>;
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectPlaceholder, SelectValue };
