export function estimateExecutionTime(workflowType: string): string {
  const estimates: Record<string, string> = {
    "Image Generation": "2-5 minutes",
    "Video Generation": "10-30 minutes",
    "Audio Generation": "3-8 minutes",
    "Script Generation": "1-3 minutes",
    "Media Processing": "5-15 minutes",
    "Rendering": "15-60 minutes",
    "Publishing Preparation": "2-5 minutes",
    "Custom Workflow": "5-15 minutes",
  };
  return estimates[workflowType] || "5-15 minutes";
}
