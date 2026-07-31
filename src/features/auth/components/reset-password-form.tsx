"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logger } from "@/core/logger";
import { useLocalizationContext } from "@/providers/localization";
import { PasswordStrengthMeter } from "@/features/auth/components/password-strength-meter";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormInner({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useLocalizationContext();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  const onSubmit = async (values: ResetPasswordFormData) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("auth.resetPasswordForm.error.resetFailed"));
      }

      toast.success(t("auth.resetPasswordForm.success"));
      router.push("/login");
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Reset password error", error);
        toast.error(error.message || t("auth.resetPasswordForm.error.resetFailed"));
      } else {
        logger.error("Reset password error", new Error(String(error)));
        toast.error(t("auth.resetPasswordForm.error.resetFailedLater"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("auth.resetPasswordForm.title")}</CardTitle>
        <CardDescription>{t("auth.resetPasswordForm.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.resetPasswordForm.newPasswordLabel")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.resetPasswordForm.newPasswordPlaceholder")}
                {...register("password")}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-md p-1"
                aria-label={showPassword ? t("auth.loginForm.hidePassword") : t("auth.loginForm.showPassword")}
                disabled={submitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{t("auth.validation.password", errors.password.message)}</p>}
            <PasswordStrengthMeter password={password || ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("auth.resetPasswordForm.confirmPasswordLabel")}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder={t("auth.resetPasswordForm.confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-md p-1"
                aria-label={showPassword ? t("auth.loginForm.hidePassword") : t("auth.loginForm.showPassword")}
                disabled={submitting}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{t("auth.validation.confirmPassword", errors.confirmPassword.message)}</p>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
            size="lg"
          >
            {submitting ? t("auth.resetPasswordForm.resetting") : t("auth.resetPasswordButton")}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">{t("auth.resetPasswordForm.rememberPassword")}</span>
          <Link href="/login" className="text-primary hover:underline">
            {t("auth.resetPasswordForm.signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function ResetPasswordFormWithToken() {
  const { t } = useLocalizationContext();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.resetPasswordForm.invalidLink.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("auth.resetPasswordForm.invalidLink.description")}
          </p>
          <Link href="/forgot-password" className="text-primary hover:underline">
            {t("auth.resetPasswordForm.invalidLink.requestNew")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ResetPasswordFormInner token={token} />;
}

export function ResetPasswordForm({ token }: { token?: string } = {}) {
  const { t } = useLocalizationContext();

  if (token) {
    return <ResetPasswordFormInner token={token} />;
  }

  return (
    <React.Suspense fallback={<div className="text-sm text-muted-foreground">{t("common.loading")}</div>}>
      <ResetPasswordFormWithToken />
    </React.Suspense>
  );
}
