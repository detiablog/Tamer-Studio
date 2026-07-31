"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Send,
  Clock,
  History,
  FileText,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Hash,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Unlink,
  Loader,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "new" | "scheduled" | "history" | "drafts" | "calendar" | "accounts";

const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "X (Twitter)" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
];

const CAPTION_MAX = 2200;

const STATUS_COLORS: Record<string, string> = {
  published: "success",
  scheduled: "info",
  draft: "muted",
  failed: "destructive",
  cancelled: "warning",
  publishing: "info",
};

function CalendarView({ scheduledPosts, t }: { scheduledPosts: any[]; t: (key: string, fallback?: string) => string }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const postsByDay: Record<number, any[]> = {};
  (scheduledPosts || []).forEach((post: any) => {
    const d = new Date(post.scheduledFor || post.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  const monthLabel = currentDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="h-10" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasPosts = !!postsByDay[d];
    cells.push(
      <div
        key={d}
        className={`h-10 flex flex-col items-center justify-center rounded-lg text-sm relative ${isToday ? "bg-primary text-primary-foreground font-bold" : hasPosts ? "bg-muted" : ""}`}
      >
        {d}
        {hasPosts && (
          <div className="absolute bottom-1 flex gap-0.5">
            {postsByDay[d]!.slice(0, 3).map((_, i) => (
              <div key={i} className="size-1.5 rounded-full bg-primary" />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{monthLabel}</h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>
    </div>
  );
}

export function PublishingPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("new");

  const { data: scheduledData, isLoading: scheduledLoading, mutate: mutateScheduled } = useSWR("/api/publishing/scheduled", fetcher);
  const { data: historyData, isLoading: historyLoading, mutate: mutateHistory } = useSWR("/api/publishing/history", fetcher);
  const { data: draftsData, isLoading: draftsLoading, mutate: mutateDrafts } = useSWR("/api/publishing/drafts", fetcher);
  const { data: accountsData, isLoading: accountsLoading, mutate: mutateAccounts } = useSWR("/api/publishing/accounts", fetcher);

  const [caption, setCaption] = React.useState("");
  const [hashtags, setHashtags] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [link, setLink] = React.useState("");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = React.useState("");
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const scheduledPosts = scheduledData?.data ?? [];
  const historyPosts = historyData?.data ?? [];
  const drafts = draftsData?.data ?? [];
  const accounts = accountsData?.data ?? [];

  const tabs = [
    { id: "new" as Tab, label: t("publishing.newPost"), icon: Plus },
    { id: "scheduled" as Tab, label: t("publishing.scheduledPosts"), icon: Clock },
    { id: "history" as Tab, label: t("publishing.publishingHistory"), icon: History },
    { id: "drafts" as Tab, label: t("publishing.drafts"), icon: FileText },
    { id: "calendar" as Tab, label: t("publishing.calendar"), icon: Calendar },
    { id: "accounts" as Tab, label: t("publishing.connectedAccounts"), icon: LinkIcon },
  ];

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handlePublish = async (mode: "publish" | "schedule" | "draft") => {
    if (!caption.trim()) {
      toast.error(t("publishing.caption", "Caption") + " " + t("common.required", "is required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/publishing/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          hashtags,
          location,
          link,
          platforms: selectedPlatforms,
          mode,
          scheduledFor: mode === "schedule" ? scheduleDate : undefined,
        }),
      });
      if (res.ok) {
        if (mode === "publish") toast.success(t("publishing.postPublished", "Post published successfully"));
        else if (mode === "schedule") toast.success(t("publishing.postScheduled", "Post scheduled successfully"));
        else toast.success(t("publishing.postCreated", "Post created successfully"));
        setCaption("");
        setHashtags("");
        setLocation("");
        setLink("");
        setSelectedPlatforms([]);
        setShowSchedule(false);
        setScheduleDate("");
        mutateScheduled();
        mutateHistory();
        mutateDrafts();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm(t("publishing.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/publishing/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateScheduled();
        mutateHistory();
        mutateDrafts();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleRetryPost = async (id: string) => {
    try {
      const res = await fetch(`/api/publishing/posts/${id}/retry`, { method: "POST" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateHistory();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDisconnectAccount = async (id: string) => {
    if (!window.confirm(t("publishing.confirmDisconnect"))) return;
    try {
      const res = await fetch(`/api/publishing/accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateAccounts();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const renderNewPost = () => (
    <div className="space-y-6">
      <DashboardCard title={t("publishing.newPost", "New Post")}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("publishing.caption", "Caption")}</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder={t("publishing.caption", "Caption") + "..."}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {t("publishing.characterCount", "{count} / {max} characters")
                  .replace("{count}", String(caption.length))
                  .replace("{max}", String(CAPTION_MAX))}
              </span>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                <Sparkles className="mr-1 size-3" />
                {t("publishing.aiSuggest", "AI Suggest")}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("publishing.hashtags", "Hashtags")}</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#topic #trending"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("publishing.location", "Location")}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("publishing.location", "Location")}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("publishing.link", "Link")}</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t("publishing.selectPlatforms", "Select Platforms")}</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${selectedPlatforms.includes(p.id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-sm font-medium mb-2 block">{t("publishing.media", "Media")}</label>
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">{t("publishing.selectFromAssets", "Select media from your assets library")}</p>
              <Button variant="outline" size="sm">{t("publishing.selectFromAssetsButton", "Select from Assets")}</Button>
            </div>
          </div>

          {showSchedule && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("publishing.scheduledFor", "Scheduled for")}</label>
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => handlePublish("publish")} disabled={submitting || selectedPlatforms.length === 0}>
              {submitting ? <Loader className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
              {t("publishing.publishNow", "Publish Now")}
            </Button>
            <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)} disabled={submitting || selectedPlatforms.length === 0}>
              <Clock className="mr-2 size-4" />
              {t("publishing.scheduleLater", "Schedule Later")}
            </Button>
            {showSchedule && scheduleDate && (
              <Button variant="outline" onClick={() => handlePublish("schedule")} disabled={submitting || selectedPlatforms.length === 0}>
                {t("publishing.confirmSchedule", "Confirm Schedule")}
              </Button>
            )}
            <Button variant="ghost" onClick={() => handlePublish("draft")} disabled={submitting || !caption.trim()}>
              <FileText className="mr-2 size-4" />
              {t("publishing.saveDraft", "Save Draft")}
            </Button>
          </div>
        </div>
      </DashboardCard>
    </div>
  );

  const renderScheduled = () => (
    <DashboardCard title={t("publishing.scheduledPosts", "Scheduled")}>
      {scheduledLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : scheduledPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Clock className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("publishing.noScheduled", "No scheduled posts")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.description", "Content")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("publishing.platforms", "Platforms")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("publishing.scheduledFor", "Scheduled For")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {scheduledPosts.map((post: any) => (
                <tr key={post.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 max-w-[300px] truncate">{post.caption || post.title || "—"}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1 flex-wrap">
                      {(post.platforms || []).map((p: string) => (
                        <Badge key={p} tone="info">{p}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {post.scheduledFor || post.scheduledAt
                      ? new Date(post.scheduledFor || post.scheduledAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-3 px-2">
                    <Badge tone={STATUS_COLORS[post.status] as any || "muted"}>{post.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  const renderHistory = () => (
    <DashboardCard title={t("publishing.publishingHistory", "History")}>
      {historyLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : historyPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <History className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("publishing.noPosts", "No posts yet")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.description", "Content")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("publishing.platforms", "Platforms")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("publishing.publishedAt", "Published At")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {historyPosts.map((post: any) => (
                <tr key={post.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 max-w-[300px] truncate">{post.caption || post.title || "—"}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1 flex-wrap">
                      {(post.platforms || []).map((p: string) => (
                        <Badge key={p} tone="info">{p}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 px-2">
                    <Badge tone={STATUS_COLORS[post.status] as any || "muted"}>{post.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {post.link && (
                        <Button variant="ghost" size="icon-sm" onClick={() => window.open(post.link, "_blank")}>
                          <ExternalLink className="size-3.5" />
                        </Button>
                      )}
                      {post.status === "failed" && (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleRetryPost(post.id)}>
                          <RefreshCw className="size-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  const renderDrafts = () => (
    <DashboardCard title={t("publishing.drafts", "Drafts")}>
      {draftsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <FileText className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("publishing.noDrafts", "No drafts saved")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft: any) => (
            <div key={draft.id} className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm line-clamp-3 mb-3">{draft.caption || draft.title || "—"}</p>
              <div className="flex gap-1 flex-wrap mb-3">
                {(draft.platforms || []).map((p: string) => (
                  <Badge key={p} tone="info">{p}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : "—"}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm">
                    <Edit3 className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Send className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePost(draft.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderCalendar = () => (
    <DashboardCard title={t("publishing.calendar", "Calendar")}>
      <CalendarView scheduledPosts={scheduledPosts} t={t} />
    </DashboardCard>
  );

  const renderAccounts = () => (
    <DashboardCard title={t("publishing.connectedAccounts", "Connected Accounts")}>
      {accountsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <LinkIcon className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-4">{t("publishing.noAccounts", "No connected accounts")}</p>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 size-4" />
            {t("publishing.connectAccount", "Connect Account")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              {t("publishing.connectAccount", "Connect Account")}
            </Button>
          </div>
          {accounts.map((account: any) => (
            <div key={account.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                  <Share2 className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{account.username || account.displayName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={account.status === "connected" ? "success" : "warning"}>
                  {account.status}
                </Badge>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDisconnectAccount(account.id)}>
                  <Unlink className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("publishing.title", "Publishing Hub")} description={t("publishing.description", "Publish your AI-generated content to social media")} />

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "new" && renderNewPost()}
      {activeTab === "scheduled" && renderScheduled()}
      {activeTab === "history" && renderHistory()}
      {activeTab === "drafts" && renderDrafts()}
      {activeTab === "calendar" && renderCalendar()}
      {activeTab === "accounts" && renderAccounts()}
    </div>
  );
}
