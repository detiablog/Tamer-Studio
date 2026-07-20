export type NodeCategory =
  | "ai"
  | "media"
  | "flow"
  | "storage"
  | "publishing"
  | "logic"
  | "input"
  | "output"
  | "utility"
  | "system";

export const NODE_CATEGORIES: readonly NodeCategory[] = [
  "ai",
  "media",
  "flow",
  "storage",
  "publishing",
  "logic",
  "input",
  "output",
  "utility",
  "system",
];

export const NODE_CATEGORY_LABELS: Record<NodeCategory, string> = {
  ai: "AI",
  media: "Media",
  flow: "Flow",
  storage: "Storage",
  publishing: "Publishing",
  logic: "Logic",
  input: "Input",
  output: "Output",
  utility: "Utility",
  system: "System",
};
