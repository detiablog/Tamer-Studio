import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Clapperboard,
  Cpu,
  FolderOpen,
  ImageIcon,
  Play,
  Rocket,
  Settings2,
  Workflow,
} from "lucide-react";

export const metadata = {
  title: "Tamer Studio",
  description:
    "Tamer Studio is a premium AI production platform for managing workspaces, projects, media, production pipelines, and publishing.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/60 via-background to-background" />

        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Rocket className="size-6" />
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              From intent to production.
            </h1>

            <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
              Tamer Studio is an AI-first production operating system. Plan, generate,
              organize, review, and publish content without switching between tools.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">
                Get started
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for modern content teams
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to manage the complete content lifecycle in one place.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Workspaces",
                description:
                  "Organize teams, members, and permissions across multiple workspaces.",
                icon: Boxes,
              },
              {
                title: "Projects",
                description:
                  "Manage production projects with folders, tags, assets, and archiving.",
                icon: FolderOpen,
              },
              {
                title: "Media",
                description:
                  "Generate and organize images, video, audio, and documents in one library.",
                icon: ImageIcon,
              },
              {
                title: "Production",
                description:
                  "Run production pipelines with queues, retries, logs, and progress tracking.",
                icon: Clapperboard,
              },
              {
                title: "AI Platform",
                description:
                  "Connect providers, manage models, and compose prompts with a unified playground.",
                icon: Cpu,
              },
              {
                title: "Publishing",
                description:
                  "Schedule and publish content to external platforms from a single hub.",
                icon: Play,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-card p-6 transition hover:border-foreground/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Designed for clarity, speed, and confidence
              </h2>
              <p className="mt-4 text-muted-foreground leading-7">
                Every screen answers one question: what should I do next? Tamer Studio
                removes tool switching, reduces repetitive work, and keeps your team
                focused on creation.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Settings2 className="mt-0.5 size-4 shrink-0 text-foreground" />
                  Unified workspace across projects, media, and production
                </li>
                <li className="flex items-start gap-2">
                  <Workflow className="mt-0.5 size-4 shrink-0 text-foreground" />
                  Extensible AI platform with provider marketplace
                </li>
                <li className="flex items-start gap-2">
                  <Rocket className="mt-0.5 size-4 shrink-0 text-foreground" />
                  Production-first workflows with auditability and replay
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Consistency
                  </p>
                  <p className="mt-2 text-2xl font-semibold">100%</p>
                  <p className="text-xs text-muted-foreground">
                    Single source of truth for AI providers and prompts
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Speed
                  </p>
                  <p className="mt-2 text-2xl font-semibold">Less switching</p>
                  <p className="text-xs text-muted-foreground">
                    Every workflow lives in one operating system
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Scale
                  </p>
                  <p className="mt-2 text-2xl font-semibold">Teams</p>
                  <p className="text-xs text-muted-foreground">
                    From solo creators to organizations
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Control
                  </p>
                  <p className="mt-2 text-2xl font-semibold">Human-led</p>
                  <p className="text-xs text-muted-foreground">
                    AI assists; you make the final decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Start producing with Tamer Studio
            </h2>
            <p className="mt-3 text-muted-foreground">
              Create your account and bring your team into one AI-native production environment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">
                Create account
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
          Tamer Studio. From intent to production.
        </div>
      </footer>
    </main>
  );
}
