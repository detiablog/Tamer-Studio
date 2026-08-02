import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Tamer Studio API",
      description: "AI-powered creative platform API",
      version: "1.0.0",
    },
    servers: [
      { url: "/api", description: "API Base" },
    ],
    paths: {
      "/memory": { get: { summary: "List memories", tags: ["Memory"] }, post: { summary: "Create memory", tags: ["Memory"] } },
      "/memory/{id}": { get: { summary: "Get memory", tags: ["Memory"] }, put: { summary: "Update memory", tags: ["Memory"] }, delete: { summary: "Delete memory", tags: ["Memory"] } },
      "/memory/stats": { get: { summary: "Memory stats", tags: ["Memory"] } },
      "/orchestrator": { get: { summary: "List pipelines", tags: ["Orchestrator"] }, post: { summary: "Create pipeline", tags: ["Orchestrator"] } },
      "/orchestrator/templates": { get: { summary: "List templates", tags: ["Orchestrator"] } },
      "/orchestrator/executions": { get: { summary: "List executions", tags: ["Orchestrator"] } },
      "/orchestrator/stats": { get: { summary: "Orchestrator stats", tags: ["Orchestrator"] } },
      "/automation": { get: { summary: "List automations", tags: ["Automation"] }, post: { summary: "Create automation", tags: ["Automation"] } },
      "/automation/validate": { post: { summary: "Validate conditions", tags: ["Automation"] } },
      "/automation/stats": { get: { summary: "Automation stats", tags: ["Automation"] } },
      "/ai-gateway/models": { get: { summary: "List models", tags: ["AI Gateway"] } },
      "/ai-gateway/health": { get: { summary: "Provider health", tags: ["AI Gateway"] } },
      "/ai-gateway/routing": { post: { summary: "Route request", tags: ["AI Gateway"] } },
      "/prompts": { get: { summary: "List prompts", tags: ["Prompts"] }, post: { summary: "Create prompt", tags: ["Prompts"] } },
      "/prompts/analyze": { post: { summary: "Analyze prompt", tags: ["Prompts"] } },
      "/prompts/optimize": { post: { summary: "Optimize prompt", tags: ["Prompts"] } },
      "/quality": { get: { summary: "List quality reports", tags: ["Quality"] } },
      "/quality/validate": { post: { summary: "Run validation", tags: ["Quality"] } },
      "/quality/stats": { get: { summary: "Quality stats", tags: ["Quality"] } },
      "/asset-intelligence/metadata": { get: { summary: "List assets", tags: ["Assets"] } },
      "/asset-intelligence/search": { get: { summary: "Search assets", tags: ["Assets"] } },
      "/asset-intelligence/stats": { get: { summary: "Asset stats", tags: ["Assets"] } },
      "/learning/events": { get: { summary: "List events", tags: ["Learning"] }, post: { summary: "Record event", tags: ["Learning"] } },
      "/learning/recommendations": { get: { summary: "List recommendations", tags: ["Learning"] } },
      "/learning/stats": { summary: "Learning stats", tags: ["Learning"] },
      "/learning/settings": { get: { summary: "Get settings", tags: ["Learning"] }, post: { summary: "Update settings", tags: ["Learning"] } },
    },
    components: {
      securitySchemes: {
        session: { type: "apiKey", in: "cookie", name: "session_token" },
      },
    },
    security: [{ session: [] }],
  };

  return NextResponse.json(spec);
}
