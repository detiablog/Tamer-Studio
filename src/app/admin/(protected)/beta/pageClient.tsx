"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Mail, Users, MessageSquare, Bug, Lightbulb, Star, Megaphone, Target, Settings, CheckCircle, XCircle, Clock, Plus, Send, Trash2, ThumbsUp, Eye } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type TabId = "overview" | "invitations" | "users" | "feedback" | "bugs" | "features" | "ratings" | "announcements" | "readiness" | "settings";

export function BetaPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabId>("overview");

  const { data: overviewData, isLoading: overviewLoading } = useSWR("/api/beta/overview", fetcher, { revalidateOnFocus: false });
  const { data: invitationsData, isLoading: invitationsLoading, mutate: mutateInvitations } = useSWR("/api/beta/invitations", fetcher, { revalidateOnFocus: false });
  const { data: usersData, isLoading: usersLoading } = useSWR("/api/beta/users", fetcher, { revalidateOnFocus: false });
  const { data: feedbackData, isLoading: feedbackLoading } = useSWR("/api/beta/feedback", fetcher, { revalidateOnFocus: false });
  const { data: bugsData, isLoading: bugsLoading } = useSWR("/api/beta/bugs", fetcher, { revalidateOnFocus: false });
  const { data: featuresData, isLoading: featuresLoading } = useSWR("/api/beta/features", fetcher, { revalidateOnFocus: false });
  const { data: ratingsData, isLoading: ratingsLoading } = useSWR("/api/beta/ratings", fetcher, { revalidateOnFocus: false });
  const { data: announcementsData, isLoading: announcementsLoading, mutate: mutateAnnouncements } = useSWR("/api/beta/announcements", fetcher, { revalidateOnFocus: false });
  const { data: readinessData, isLoading: readinessLoading, mutate: mutateReadiness } = useSWR("/api/beta/readiness", fetcher, { revalidateOnFocus: false });
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/beta/settings", fetcher, { revalidateOnFocus: false });

  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteMaxUses, setInviteMaxUses] = React.useState(1);
  const [inviteExpiry, setInviteExpiry] = React.useState(30);
  const [feedbackFilter, setFeedbackFilter] = React.useState("all");
  const [bugSeverityFilter, setBugSeverityFilter] = React.useState("all");
  const [bugStatusFilter, setBugStatusFilter] = React.useState("all");
  const [announcementTitle, setAnnouncementTitle] = React.useState("");
  const [announcementContent, setAnnouncementContent] = React.useState("");
  const [announcementType, setAnnouncementType] = React.useState("info");
  const [settingsDraft, setSettingsDraft] = React.useState<any>(null);

  React.useEffect(() => {
    if (settingsData?.data) setSettingsDraft(settingsData.data);
  }, [settingsData]);

  const handleCreateInvitation = async () => {
    if (!inviteEmail) {
      toast.error(t("beta.inviteEmail", "Please enter an email"));
      return;
    }
    try {
      const res = await fetch("/api/beta/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, maxUses: inviteMaxUses, expiresInDays: inviteExpiry }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("beta.invitationCreated", "Invitation created"));
      setInviteEmail("");
      mutateInvitations();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await fetch(`/api/beta/invitations/${id}/revoke`, { method: "POST" });
      toast.success(t("beta.revokeInvite", "Invitation revoked"));
      mutateInvitations();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleVoteFeature = async (id: string) => {
    try {
      await fetch(`/api/beta/features/${id}/vote`, { method: "POST" });
      toast.success(t("common.success", "Voted"));
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleVoteBug = async (id: string) => {
    try {
      await fetch(`/api/beta/bugs/${id}/vote`, { method: "POST" });
      toast.success(t("common.success", "Voted"));
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleResolveBug = async (id: string) => {
    try {
      await fetch(`/api/beta/bugs/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "fixed" }),
      });
      toast.success(t("common.success", "Bug resolved"));
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    try {
      await fetch(`/api/beta/announcements/${id}/publish`, { method: "POST" });
      toast.success(t("beta.announcementPublished", "Announcement published"));
      mutateAnnouncements();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await fetch(`/api/beta/announcements/${id}`, { method: "DELETE" });
      toast.success(t("common.success", "Deleted"));
      mutateAnnouncements();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      toast.error(t("common.error", "Please fill all fields"));
      return;
    }
    try {
      await fetch("/api/beta/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: announcementTitle, content: announcementContent, type: announcementType }),
      });
      toast.success(t("beta.announcementPublished", "Announcement created"));
      setAnnouncementTitle("");
      setAnnouncementContent("");
      mutateAnnouncements();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCalculateReadiness = async () => {
    try {
      await fetch("/api/beta/readiness", { method: "POST" });
      toast.success(t("beta.readinessCalculated", "Readiness calculated"));
      mutateReadiness();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsDraft) return;
    try {
      await fetch("/api/beta/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsDraft),
      });
      toast.success(t("beta.settingsUpdated", "Settings updated"));
      mutateSettings();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const overview = overviewData?.data;
  const invitations = invitationsData?.data?.data || [];
  const users = usersData?.data?.data || [];
  const feedback = feedbackData?.data?.data || [];
  const bugs = bugsData?.data?.data || [];
  const features = featuresData?.data?.data || [];
  const ratings = ratingsData?.data?.data || [];
  const announcements = announcementsData?.data?.data || [];
  const readiness = readinessData?.data;
  const settings = settingsData?.data;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: t("beta.overview", "Overview"), icon: <Eye className="size-4" /> },
    { id: "invitations", label: t("beta.invitations", "Invitations"), icon: <Mail className="size-4" /> },
    { id: "users", label: t("beta.users", "Users"), icon: <Users className="size-4" /> },
    { id: "feedback", label: t("beta.feedback", "Feedback"), icon: <MessageSquare className="size-4" /> },
    { id: "bugs", label: t("beta.bugs", "Bug Reports"), icon: <Bug className="size-4" /> },
    { id: "features", label: t("beta.features", "Features"), icon: <Lightbulb className="size-4" /> },
    { id: "ratings", label: t("beta.ratings", "Ratings"), icon: <Star className="size-4" /> },
    { id: "announcements", label: t("beta.announcements", "Announcements"), icon: <Megaphone className="size-4" /> },
    { id: "readiness", label: t("beta.readiness", "Readiness"), icon: <Target className="size-4" /> },
    { id: "settings", label: t("beta.settings", "Settings"), icon: <Settings className="size-4" /> },
  ];

  const readinessColor = (status: string) => {
    if (status === "ga_ready") return "success";
    if (status === "beta_stable") return "warning";
    if (status === "needs_improvement") return "muted";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("beta.title", "Closed Beta")} description={t("beta.description", "Manage the closed beta program, invitations, feedback, bugs, and readiness")} />

      <DashboardCard>
        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("beta.invitations", "Invitations")}</p>
                    <p className="text-2xl font-bold">{overview?.invitations?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{overview?.invitations?.accepted ?? 0} {t("beta.accepted", "accepted")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("beta.users", "Beta Users")}</p>
                    <p className="text-2xl font-bold">{overview?.users?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{overview?.users?.active ?? 0} {t("beta.active", "active")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("beta.feedback", "Feedback")}</p>
                    <p className="text-2xl font-bold">{overview?.feedback?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{overview?.feedback?.avgRating ?? 0} {t("beta.averageRating", "avg rating")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("beta.bugs", "Bug Reports")}</p>
                    <p className="text-2xl font-bold">{overview?.bugs?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{overview?.bugs?.open ?? 0} {t("beta.status", "open")}</p>
                  </div>
                </div>
                {overview?.readiness && (
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{t("beta.overallScore", "Readiness Score")}</p>
                      <Badge tone={readinessColor(overview.readiness.status)}>{overview.readiness.status}</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-primary rounded-full h-3 transition-all" style={{ width: `${overview.readiness.overallScore}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{overview.readiness.overallScore}/100</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("beta.featureRequestCount", "Feature Requests")}</p>
                    <p className="text-2xl font-bold">{overview?.featureRequests?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{overview?.featureRequests?.totalVotes ?? 0} {t("beta.votes", "total votes")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("beta.averageRating", "Average Rating")}</p>
                    <p className="text-2xl font-bold">{overview?.ratings?.avgRating ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{overview?.ratings?.total ?? 0} {t("beta.ratings", "ratings")}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "invitations" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={t("beta.inviteEmail", "Email address")} className="flex-1 min-w-[200px]" />
              <Input type="number" value={inviteMaxUses} onChange={(e) => setInviteMaxUses(parseInt(e.target.value) || 1)} placeholder={t("beta.inviteCode", "Max uses")} className="w-24" />
              <Input type="number" value={inviteExpiry} onChange={(e) => setInviteExpiry(parseInt(e.target.value) || 30)} placeholder="Days" className="w-24" />
              <Button onClick={handleCreateInvitation}><Plus className="mr-1 size-4" />{t("beta.invitations", "Invite")}</Button>
            </div>
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noInvitations", "No invitations yet")}</p>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">{inv.code} - {inv.currentUses}/{inv.maxUses} uses</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={inv.status === "accepted" ? "success" : inv.status === "revoked" ? "warning" : inv.status === "expired" ? "muted" : "warning"}>{inv.status}</Badge>
                      {inv.status === "pending" && (
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => handleRevokeInvitation(inv.id)}><XCircle className="size-4 text-destructive" /></Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {usersLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noUsers", "No beta users yet")}</p>
            ) : (
              <div className="space-y-2">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Users className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{user.userId}</p>
                        <p className="text-xs text-muted-foreground">{t("beta.role", "Role")}: {user.role || "tester"} - {t("beta.joinedAt", "Joined")}: {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{user.feedbackCount || 0} {t("beta.feedback", "fb")}</span>
                      <span>{user.bugCount || 0} {t("beta.bugs", "bugs")}</span>
                      <Badge tone={user.status === "active" ? "success" : "muted"}>{user.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <select value={feedbackFilter} onChange={(e) => setFeedbackFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t("common.all", "All")}</option>
                <option value="ui">{t("beta.category", "UI")}</option>
                <option value="performance">{t("beta.performance", "Performance")}</option>
                <option value="feature">{t("beta.features", "Feature")}</option>
                <option value="other">{t("beta.description", "Other")}</option>
              </select>
            </div>
            {feedbackLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : feedback.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noFeedback", "No feedback yet")}</p>
            ) : (
              <div className="space-y-2">
                {feedback.filter((f: any) => feedbackFilter === "all" || f.category === feedbackFilter).map((item: any) => (
                  <div key={item.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-1">
                        <Badge tone={item.severity === "critical" ? "warning" : item.severity === "high" ? "warning" : "muted"}>{item.severity || "low"}</Badge>
                        <Badge tone={item.status === "open" ? "warning" : "success"}>{item.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    {item.rating && <p className="text-xs text-muted-foreground mt-1">Rating: {item.rating}/5</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bugs" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <select value={bugSeverityFilter} onChange={(e) => setBugSeverityFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t("common.all", "All Severity")}</option>
                <option value="critical">{t("beta.bugSeverity", "Critical")}</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select value={bugStatusFilter} onChange={(e) => setBugStatusFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t("common.all", "All Status")}</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            {bugsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : bugs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noBugs", "No bug reports yet")}</p>
            ) : (
              <div className="space-y-2">
                {bugs.filter((b: any) => (bugSeverityFilter === "all" || b.severity === bugSeverityFilter) && (bugStatusFilter === "all" || b.status === bugStatusFilter)).map((bug: any) => (
                  <div key={bug.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{bug.title}</p>
                      <div className="flex items-center gap-1">
                        <Badge tone={bug.severity === "critical" ? "warning" : bug.severity === "high" ? "warning" : "muted"}>{bug.severity || "low"}</Badge>
                        <Badge tone={bug.status === "open" ? "warning" : "success"}>{bug.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{bug.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{bug.votes || 0} {t("beta.votes", "votes")}</span>
                      {bug.status === "open" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleVoteBug(bug.id)}><ThumbsUp className="mr-1 size-3" />Vote</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleResolveBug(bug.id)}><CheckCircle className="mr-1 size-3" />Resolve</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-4">
            {featuresLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : features.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noFeatures", "No feature requests yet")}</p>
            ) : (
              <div className="space-y-2">
                {features.map((feat: any) => (
                  <div key={feat.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{feat.title}</p>
                      <div className="flex items-center gap-1">
                        <Badge tone={feat.status === "approved" ? "success" : feat.status === "rejected" ? "warning" : "warning"}>{feat.status}</Badge>
                      </div>
                    </div>
                    {feat.description && <p className="text-xs text-muted-foreground mb-2">{feat.description}</p>}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{feat.votes || 0} {t("beta.votes", "votes")}</span>
                      {feat.category && <Badge tone="muted">{feat.category}</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => handleVoteFeature(feat.id)}><ThumbsUp className="mr-1 size-3" />Vote</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ratings" && (
          <div className="space-y-4">
            {ratingsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : ratings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noRatings", "No ratings yet")}</p>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[...new Set(ratings.map((r: any) => r.ratingType))].map((type) => {
                    const typeRatings = ratings.filter((r: any) => r.ratingType === type);
                    const avg = typeRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / typeRatings.length;
                    return (
                      <div key={type as string} className="rounded-lg border border-border p-4">
                        <p className="text-xs text-muted-foreground mb-1">{type as string}</p>
                        <p className="text-2xl font-bold">{avg.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">{typeRatings.length} {t("beta.ratings", "ratings")}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {ratings.map((rating: any) => (
                    <div key={rating.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{rating.ratingType}</p>
                        <p className="text-xs text-muted-foreground">{rating.comment || "No comment"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`size-4 ${i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("beta.announcements", "New Announcement")}</h3>
              <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder={t("beta.title", "Title")} />
              <textarea value={announcementContent} onChange={(e) => setAnnouncementContent(e.target.value)} placeholder={t("beta.description", "Content")} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]" />
              <div className="flex items-center gap-2">
                <select value={announcementType} onChange={(e) => setAnnouncementType(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="info">Info</option>
                  <option value="update">Update</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <Button onClick={handleCreateAnnouncement}><Plus className="mr-1 size-4" />Create</Button>
              </div>
            </div>
            {announcementsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.noAnnouncements", "No announcements yet")}</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{ann.title}</p>
                      <div className="flex items-center gap-1">
                        <Badge tone={ann.isPublished ? "success" : "warning"}>{ann.isPublished ? t("beta.published", "Published") : t("beta.pending", "Draft")}</Badge>
                        {!ann.isPublished && (
                          <Button variant="ghost" size="sm" onClick={() => handlePublishAnnouncement(ann.id)}><Send className="mr-1 size-3" />Publish</Button>
                        )}
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDeleteAnnouncement(ann.id)}><Trash2 className="size-4 text-destructive" /></Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "readiness" && (
          <div className="space-y-6">
            {readinessLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <>
                {readiness ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">{t("beta.overallScore", "Overall Score")}</h3>
                        <Badge tone={readinessColor(readiness.status)}>{readiness.status?.replace("_", " ")}</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4 mb-2">
                        <div className="bg-primary rounded-full h-4 transition-all" style={{ width: `${readiness.overallScore}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{readiness.overallScore}/100</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.bugSeverity", "Bug Severity")}</p>
                        <p className="text-lg font-bold">{readiness.bugSeverity}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.userSatisfaction", "User Satisfaction")}</p>
                        <p className="text-lg font-bold">{readiness.userSatisfaction}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.performance", "Performance")}</p>
                        <p className="text-lg font-bold">{readiness.performance}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.security", "Security")}</p>
                        <p className="text-lg font-bold">{readiness.security}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.localization", "Localization")}</p>
                        <p className="text-lg font-bold">{readiness.localization}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.accessibility", "Accessibility")}</p>
                        <p className="text-lg font-bold">{readiness.accessibility}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{t("beta.aiSuccessRate", "AI Success Rate")}</p>
                        <p className="text-lg font-bold">{readiness.aiSuccessRate}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">{t("beta.notReady", "No readiness data calculated yet")}</p>
                )}
                <Button onClick={handleCalculateReadiness}><Target className="mr-1 size-4" />{t("beta.calculateReadiness", "Calculate Readiness")}</Button>
              </>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4 max-w-xl">
            {settingsLoading ? (
              <div className="flex items-center justify-center py-12"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
            ) : settingsDraft ? (
              <>
                <div className="space-y-3">
                  {[
                    { key: "betaEnabled", label: t("beta.betaEnabled", "Beta Enabled") },
                    { key: "requireInvitation", label: t("beta.requireInvitation", "Require Invitation") },
                    { key: "autoApprove", label: t("beta.autoApprove", "Auto Approve") },
                    { key: "feedbackEnabled", label: t("beta.feedbackEnabled", "Feedback Enabled") },
                    { key: "bugReportingEnabled", label: t("beta.bugReportingEnabled", "Bug Reporting Enabled") },
                    { key: "featureRequestsEnabled", label: t("beta.featureRequestsEnabled", "Feature Requests Enabled") },
                    { key: "announcementsEnabled", label: t("beta.announcementsEnabled", "Announcements Enabled") },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <label className="text-sm font-medium">{item.label}</label>
                      <button
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settingsDraft[item.key] ? "bg-primary" : "bg-muted"}`}
                        onClick={() => setSettingsDraft((prev: any) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      >
                        <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${settingsDraft[item.key] ? "translate-x-4.5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("beta.maxUsers", "Max Users")}</label>
                    <Input type="number" value={settingsDraft.maxUsers || 100} onChange={(e) => setSettingsDraft((prev: any) => ({ ...prev, maxUsers: parseInt(e.target.value) || 100 }))} />
                  </div>
                </div>
                <Button onClick={handleSaveSettings}>{t("common.save", "Save Settings")}</Button>
              </>
            ) : null}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
