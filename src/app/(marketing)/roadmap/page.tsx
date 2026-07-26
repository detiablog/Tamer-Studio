"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { Badge } from "@/components/ui/Badge";
import { ArrowUp } from "lucide-react";

export default function RoadmapPage() {
  const { t } = useLocalizationContext();
  const [votes, setVotes] = React.useState<Record<number, number>>({});
  const [userVotes, setUserVotes] = React.useState<Record<number, boolean>>({});

  const roadmap = {
    planned: [
      { id: 1, title: t("marketing.roadmap.planned1.title", "Batch generation queues"), description: t("marketing.roadmap.planned1.desc", "Run multiple AI jobs in sequence with automatic retries and notifications.") },
      { id: 2, title: t("marketing.roadmap.planned2.title", "Team permissions v2"), description: t("marketing.roadmap.planned2.desc", "Granular workspace roles with provider and budget limits per member.") },
    ],
    inProgress: [
      { id: 3, title: t("marketing.roadmap.inProgress1.title", "Prompt library migration"), description: t("marketing.roadmap.inProgress1.desc", "Move prompts into versioned collections with sharing and rollback.") },
      { id: 4, title: t("marketing.roadmap.inProgress2.title", "Provider health dashboard"), description: t("marketing.roadmap.inProgress2.desc", "Real-time latency, success rate, and cost per provider/model.") },
    ],
    completed: [
      { id: 5, title: t("marketing.roadmap.completed1.title", "Multi-provider AI"), description: t("marketing.roadmap.completed1.desc", "Connect OpenAI, Gemini, Claude, OpenRouter, and Kilo.") },
      { id: 6, title: t("marketing.roadmap.completed2.title", "Usage analytics"), description: t("marketing.roadmap.completed2.desc", "Track spend, jobs, credits, and queue depth in real time.") },
    ],
  };

  const handleVote = (id: number) => {
    setVotes((v) => ({ ...v, [id]: (v[id] || 0) + 1 }));
    setUserVotes((v) => ({ ...v, [id]: true }));
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.roadmapTitle")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("marketing.roadmapDescription")}</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("marketing.roadmapPlanned")}</h2>
            <div className="mt-4 space-y-4">
              {roadmap.planned.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{votes[item.id] || 0} {t("marketing.roadmapVotes", "votes")}</span>
                    <button
                      onClick={() => handleVote(item.id)}
                      disabled={userVotes[item.id]}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                    >
                      <ArrowUp className="size-3.5" /> {t("marketing.roadmapVote")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("marketing.roadmapInProgress")}</h2>
            <div className="mt-4 space-y-4">
              {roadmap.inProgress.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
                  <Badge tone="warning">{t("marketing.inProgress", "In Progress")}</Badge>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{votes[item.id] || 0} {t("marketing.roadmapVotes", "votes")}</span>
                    <button
                      onClick={() => handleVote(item.id)}
                      disabled={userVotes[item.id]}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                    >
                      <ArrowUp className="size-3.5" /> {t("marketing.roadmapVote")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("marketing.roadmapCompleted")}</h2>
            <div className="mt-4 space-y-4">
              {roadmap.completed.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
                  <Badge tone="success">{t("common.success")}</Badge>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
