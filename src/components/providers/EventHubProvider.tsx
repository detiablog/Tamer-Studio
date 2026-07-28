"use client";

import * as React from "react";
import { bootstrapEventRuntime, teardownEventRuntime } from "@/lib/bootstrap";

export function EventHubProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    bootstrapEventRuntime();

    return () => {
      teardownEventRuntime();
    };
  }, []);

  return <>{children}</>;
}
