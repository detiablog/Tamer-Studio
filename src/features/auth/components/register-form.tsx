"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { hasAuthError } from "@/features/auth/types";
import { logger } from "@/core/logger";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocalizationContext } from "@/providers/localization";

export function RegisterForm() {
  const { t } = useLocalizationContext();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterSchema) => {
    try {
      setSubmitting(true);
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });

      if (hasAuthError(result) && result.error?.message) {
        logger.error("Registration failed", new Error(result.error.message));
        toast.error(t("auth.invalidCredentials"));
        return;
      }

      if (hasAuthError(result)) {
        logger.error("Registration failed with unknown auth error", new Error(result.error?.message ?? "Unknown auth error"));
        toast.error(t("common.genericError"));
        return;
      }

      toast.success(t("auth.accountCreated"));
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Unexpected registration error", err);
      } else {
        logger.error("Unexpected registration error", new Error(String(err)));
      }
      toast.error(t("common.genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("auth.signUpTitle")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.nameLabel")}</Label>
            <Input id="name" type="text" placeholder="John Doe" {...register("name")} autoComplete="name" aria-invalid={!!errors.name} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.emailLabel")}</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} autoComplete="email" aria-invalid={!!errors.email} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordLabel")}
                {...register("password")}
                autoComplete="new-password"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? t("auth.creatingAccount") : t("auth.signUpButton")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
