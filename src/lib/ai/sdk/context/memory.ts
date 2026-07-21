import type { WorkflowMemory } from "../types";

export function createWorkflowMemory(initial: Record<string, unknown> = {}): WorkflowMemory {
  const store = new Map(Object.entries(initial));
  return {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    has: (key: string) => store.has(key),
    delete: (key: string) => store.delete(key),
    clear: () => store.clear(),
    entries: () => Object.fromEntries(store),
  };
}
