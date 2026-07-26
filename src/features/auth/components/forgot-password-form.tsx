"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logger } from "@/core/logger";
import { useLocalizationContext } from "@/providers/localization";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { t } = useLocalizationContext();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setSubmitting(true);

      // Call API to send password reset email
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("auth.forgotPasswordForm.error.sendFailed"));
      }

      setSubmittedEmail(values.email);
      setSubmitted(true);
      toast.success(t("auth.forgotPasswordForm.checkEmail.toastSuccess"));
      reset();
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Forgot password error", error);
        toast.error(error.message || t("auth.forgotPasswordForm.error.sendFailed"));
      } else {
        logger.error("Forgot password error", new Error(String(error)));
        toast.error(t("auth.forgotPasswordForm.error.sendFailedLater"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.forgotPasswordForm.checkEmail.title")}</CardTitle>
          <CardDescription>{t("auth.forgotPasswordForm.checkEmail.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              {t("auth.forgotPasswordForm.checkEmail.sentTo", "We've sent a password reset link to")} <strong>{submittedEmail}</strong>
            </p>
            <p className="mt-2">
              {t("auth.forgotPasswordForm.checkEmail.clickLink")}
            </p>
            <p className="mt-2">
              {t("auth.forgotPasswordForm.checkEmail.expires")}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("auth.forgotPasswordForm.checkEmail.didntReceive")}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              {t("auth.forgotPasswordForm.checkEmail.tryAnother")}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="text-primary hover:underline">
              {t("auth.forgotPasswordForm.checkEmail.backToLogin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("auth.forgotPasswordForm.title")}</CardTitle>
        <CardDescription>{t("auth.forgotPasswordForm.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.forgotPasswordForm.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.forgotPasswordForm.emailPlaceholder")}
              {...register("email")}
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={submitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
            size="lg"
          >
            {submitting ? t("auth.forgotPasswordForm.sending") : t("auth.forgotPasswordForm.submitButton")}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">{t("auth.forgotPasswordForm.rememberPassword")}</span>
          <Link href="/login" className="text-primary hover:underline">
            {t("auth.forgotPasswordForm.signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
