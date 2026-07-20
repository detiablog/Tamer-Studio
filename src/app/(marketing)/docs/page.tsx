export const metadata = {
  title: "Documentation - Tamer Studio",
  description: "Documentation for Tamer Studio.",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          Learn how to use Tamer Studio to manage your content production lifecycle.
        </p>
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold">Getting Started</h3>
            <p className="text-sm text-muted-foreground">Set up your workspace and connect your first AI provider.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold">Projects</h3>
            <p className="text-sm text-muted-foreground">Organize production projects with folders, tags, and assets.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold">AI Platform</h3>
            <p className="text-sm text-muted-foreground">Connect providers, manage models, and compose prompts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
