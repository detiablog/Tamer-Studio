"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function Switch({ checked: controlledChecked, onCheckedChange, disabled, className, id }: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(controlledChecked ?? false);
  const checked = controlledChecked ?? internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    setInternalChecked(next);
    onCheckedChange?.(next);
  };

  React.useEffect(() => { if (controlledChecked !== undefined) setInternalChecked(controlledChecked); }, [controlledChecked]);

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      onClick={toggle}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

export { Switch };
