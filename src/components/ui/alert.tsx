import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success";
}

function Alert({ variant = "default", className, ...props }: AlertProps) {
  const variants: Record<string, string> = {
    default: "bg-background text-foreground border",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    warning: "border-yellow-500/50 text-yellow-600 dark:text-yellow-400 [&>svg]:text-yellow-500",
    success: "border-green-500/50 text-green-600 dark:text-green-400 [&>svg]:text-green-500",
  };

  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn("relative w-full rounded-lg border p-4", variants[variant], className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
