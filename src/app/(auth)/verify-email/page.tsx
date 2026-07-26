"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [displayEmail, setDisplayEmail] = React.useState<string>(email ?? "");
  const [resending, setResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [resendError, setResendError] = React.useState(false);

  React.useEffect(() => {
    if (!token) {
      return;
    }

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

  const handleResend = async () => {
    if (!displayEmail) {
      toast.error(t("auth.verifyEmail.emailRequired") || "Email is required");
      return;
    }

    setResending(true);
    setResendSuccess(false);
    setResendError(false);

    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: displayEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setResendSuccess(true);
        toast.success(t("auth.verifyEmail.resendSuccess") || "Verification email resent successfully");
      } else {
        throw new Error(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      setResendError(true);
      toast.error((error instanceof Error ? error.message : undefined) || (t("auth.verifyEmail.resendError") || "Failed to resend verification email"));
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
            <span className="ml-2 text-sm text-muted-foreground">{t("auth.verifyEmail.loading") || "Verifying your email..."}</span>
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
                <p className="text-sm text-muted-foreground">{t("auth.verifyEmail.successDescription") || "Your email has been verified. Redirecting to login..."}</p>
              </div>
            </div>
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
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle>{t("auth.resetPasswordForm.invalidLink.title") || "Invalid reset link"}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("auth.resetPasswordForm.invalidLink.description") || "The verification link is invalid or has expired."}
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push("/register")}>
              {t("auth.resetPasswordForm.invalidLink.requestNew") || "Request a new verification link"}
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            {t("auth.verifyEmail.checkTitle") || "Check your email"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 border border-border/50 p-4 text-sm text-muted-foreground">
            <p>
              {t("auth.verifyEmail.sentTo", "We've sent a verification link to")}{" "}
              <span className="font-medium text-foreground">{displayEmail || t("common.email")}</span>
            </p>
            <p className="mt-2">{t("auth.verifyEmail.clickLink") || "Check your inbox and click the link to verify your email address."}</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("auth.emailLabel") || "Email"}</label>
              <Input
                type="email"
                value={displayEmail}
                onChange={(e) => setDisplayEmail(e.target.value)}
                placeholder={t("auth.registerForm.emailPlaceholder") || "you@company.com"}
                autoComplete="email"
                readOnly={!resending}
                className="h-10 bg-background/50 border-border focus:border-primary transition"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {t("auth.verifyEmail.resendButton") || "Resend Verification Email"}
            </Button>

            {resendSuccess && (
              <p className="text-sm text-green-600 text-center">
                {t("auth.verifyEmail.resendSuccess") || "Verification email resent successfully"}
              </p>
            )}
            {resendError && (
              <p className="text-sm text-destructive text-center">
                {t("auth.verifyEmail.resendError") || "Failed to resend verification email. Please try again."}
              </p>
            )}
          </div>

          <div className="text-sm">
            <Button variant="ghost" className="px-0" onClick={() => router.push("/login")}>
              {t("auth.verifyEmail.backToLogin") || "Back to login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailSuspense() {
  return (
    <Suspense fallback={
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
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

export default function VerifyEmailPage() {
  return <VerifyEmailSuspense />;
}
