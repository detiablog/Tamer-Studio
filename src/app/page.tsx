export const metadata = {
  title: "Tamer Studio",
  description: "Tamer Studio is a premium AI production platform for managing workspaces, projects, media, production, and publishing.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="max-w-3xl rounded-3xl border border-border bg-card p-10 shadow-xl shadow-black/5">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Tamer Studio</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A premium AI-first production platform for creators and teams. Manage workspaces, projects, media, production pipelines, and publishing from one elegant hub.
        </p>
      </div>
    </main>
  );
}
