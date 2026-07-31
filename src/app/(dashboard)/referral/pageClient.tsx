"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Users, Gift, Clock, CheckCircle, Link as LinkIcon, QrCode, ArrowRight } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReferralPageClient() {
  const { t } = useLocalizationContext();
  const [creating, setCreating] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/user/referral", fetcher);

  const referralData = data?.data;

  const handleCopyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      toast.success(t("referral.linkCopied", "Referral link copied to clipboard"));
    }
  };

  const handleCopyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      toast.success(t("referral.codeCopied", "Referral code copied to clipboard"));
    }
  };

  const handleCreateReferral = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/user/referral", { method: "POST" });
      if (res.ok) {
        mutate();
        toast.success(t("referral.created", "Referral link created"));
      }
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
    );
  }

  const hasReferral = !!referralData?.referralCode;
  const stats = referralData?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">{t("referral.title", "Referral Center")}</h1>
        <p className="text-muted-foreground mt-1">{t("referral.description", "Invite friends and earn rewards")}</p>
      </div>

      {!hasReferral ? (
        <DashboardCard title={t("referral.getStarted", "Get Started")}>
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Share2 className="size-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {t("referral.getStartedDesc", "Generate your unique referral link to start inviting friends and earning rewards.")}
            </p>
            <Button onClick={handleCreateReferral} disabled={creating}>
              {creating ? t("common.creating", "Creating...") : t("referral.generateLink", "Generate Referral Link")}
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("referral.totalReferred", "Total Referred")}
              value={stats.totalReferred ?? 0}
            />
            <StatCard
              title={t("referral.rewardsEarned", "Rewards Earned")}
              value={Number(stats.totalRewardsEarned ?? 0).toLocaleString()}
            />
            <StatCard
              title={t("referral.pending", "Pending")}
              value={(stats.totalReferred ?? 0) - (stats.rewardedCount ?? 0)}
            />
            <StatCard
              title={t("referral.rewarded", "Rewarded")}
              value={stats.rewardedCount ?? 0}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title={t("referral.yourLink", "Your Referral Link")}>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <LinkIcon className="size-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{referralData.referralLink}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                    <Copy className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <span className="text-sm text-muted-foreground shrink-0">{t("referral.code", "Code")}:</span>
                  <div className="flex-1">
                    <code className="text-sm font-mono font-medium">{referralData.referralCode}</code>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                    <Copy className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-center p-4 rounded-xl border border-border bg-muted/10">
                  <QrCode className="size-32 text-muted-foreground" />
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("referral.howItWorks", "How It Works")}>
              <div className="space-y-4">
                {[
                  { step: 1, icon: Share2, title: t("referral.step1Title", "Share your link"), desc: t("referral.step1Desc", "Send your referral link to friends and colleagues") },
                  { step: 2, icon: Users, title: t("referral.step2Title", "They sign up"), desc: t("referral.step2Desc", "Your friend creates an account using your link") },
                  { step: 3, icon: Gift, title: t("referral.step3Title", "Earn rewards"), desc: t("referral.step3Desc", "Both you and your friend receive bonus credits") },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {referralData.referrals && referralData.referrals.length > 0 && (
            <DashboardCard title={t("referral.recentReferrals", "Recent Referrals")}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date")}</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("referral.reward", "Reward")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralData.referrals.map((ref: any) => (
                      <tr key={ref.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-2 text-muted-foreground">
                          {new Date(ref.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-3 px-2">
                          <Badge tone={ref.status === "rewarded" ? "success" : ref.status === "active" ? "info" : "muted"}>
                            {ref.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{ref.rewardCredits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          )}
        </>
      )}
    </div>
  );
}
