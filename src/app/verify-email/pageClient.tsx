"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Clock, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type VerifyState = "loading" | "sent" | "success" | "error";

function VerifyEmailContent() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [state, setState] = React.useState<VerifyState>(token ? "loading" : "sent");
  const [resending, setResending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);

  React.useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
        });

        if (res.ok) {
          setState("success");
          toast.success(t("auth.verifyEmail.successTitle") || "Email verified successfully");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          const data = await res.json().catch(() => ({}));
          setState("error");
          toast.error(data.message || t("auth.verifyEmail.invalidToken") || "Invalid or expired verification token");
        }
      } catch {
        setState("error");
        toast.error(t("common.genericError") || "Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token, router, t]);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      toast.error(t("auth.verifyEmail.emailRequired") || "Email is required");
      return;
    }

    setResending(true);

    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success(t("auth.verifyEmail.resendSuccess") || "Verification email resent successfully");
        setCountdown(60);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      toast.error(
        (error instanceof Error ? error.message : undefined) ||
        (t("auth.verifyEmail.resendError") || "Failed to resend verification email")
      );
    } finally {
      setResending(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("auth.verifyEmail.title")}</h1>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t("auth.verifyEmail.loading") || "Verifying your email..."}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("auth.verifyEmail.title")}</h1>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle>{t("auth.verifyEmail.successTitle") || "Email verified successfully"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("auth.verifyEmail.successDescription") || "Your email has been verified. Redirecting to login..."}
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={() => router.push("/login")}>
              {t("auth.login.signInButton") || "Continue to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("auth.verifyEmail.title")}</h1>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle>{t("auth.verifyEmail.invalidToken") || "Invalid or expired link"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("auth.verifyEmail.invalidTokenDescription") || "The verification link is invalid or has expired."}
                </p>
              </div>
            </div>
            <Button className="w-full" onClick={handleResend} disabled={resending || countdown > 0}>
              {resending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {countdown > 0
                ? `${t("auth.verifyEmail.resendButton") || "Resend Verification"} (${countdown}s)`
                : t("auth.verifyEmail.resendButton") || "Resend Verification"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.verifyEmail.backToLogin") || "Back to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{t("auth.verifyEmail.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.verifyEmail.description")}</p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>{t("auth.verifyEmail.checkTitle") || "Check your inbox"}</CardTitle>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 border border-border/50 p-4 text-sm text-muted-foreground">
            <p>
              {t("auth.verifyEmail.sentTo", "We've sent a verification email to")}{" "}
              <span className="font-medium text-foreground">{email || t("common.email")}</span>
            </p>
            <p className="mt-2">
              {t("auth.verifyEmail.clickLink") || "Check your inbox and click the link to verify your email address."}
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleResend}
            disabled={resending || countdown > 0}
          >
            {resending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : countdown > 0 ? (
              <Clock className="mr-2 h-4 w-4" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {countdown > 0
              ? `${t("auth.verifyEmail.resendButton") || "Resend Verification"} (${countdown}s)`
              : t("auth.verifyEmail.resendButton") || "Resend Verification"}
          </Button>

          <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>
            {t("auth.verifyEmail.changeEmail") || "Change Email"}
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => router.push("/login")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("auth.verifyEmail.backToLogin") || "Back to Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailSuspense() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Loading...</h1>
          </div>
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

export function VerifyEmailPageClient() {
  return <VerifyEmailSuspense />;
}
