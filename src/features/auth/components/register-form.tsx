"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { hasAuthError } from "@/features/auth/types";
import { logger } from "@/core/logger";

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
    watch,
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const password = watch("password");
  const hasLengthRequirement = password?.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password || "");
  const hasNumber = /[0-9]/.test(password || "");

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
        toast.error(result.error.message || t("auth.invalidCredentials"));
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">{t("auth.nameLabel")}</Label>
        <Input 
          id="name" 
          type="text" 
          placeholder="John Doe" 
          {...register("name")} 
          autoComplete="name" 
          aria-invalid={!!errors.name}
          disabled={submitting}
          className="h-10 bg-background/50 border-border focus:border-primary transition"
        />
        {errors.name && (
          <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">{t("auth.emailLabel")}</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="you@company.com" 
          {...register("email")} 
          autoComplete="email" 
          aria-invalid={!!errors.email}
          disabled={submitting}
          className="h-10 bg-background/50 border-border focus:border-primary transition"
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold">{t("auth.passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            disabled={submitting}
            className="h-10 bg-background/50 border-border focus:border-primary transition pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={submitting}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
        )}

        {/* Password Requirements */}
        <div className="space-y-1.5 mt-3 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className={`h-3.5 w-3.5 ${hasLengthRequirement ? "text-green-500" : "text-muted-foreground"}`} />
            <span className={hasLengthRequirement ? "text-foreground" : "text-muted-foreground"}>
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className={`h-3.5 w-3.5 ${hasUpperCase ? "text-green-500" : "text-muted-foreground"}`} />
            <span className={hasUpperCase ? "text-foreground" : "text-muted-foreground"}>
              One uppercase letter
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className={`h-3.5 w-3.5 ${hasNumber ? "text-green-500" : "text-muted-foreground"}`} />
            <span className={hasNumber ? "text-foreground" : "text-muted-foreground"}>
              One number
            </span>
          </div>
        </div>
      </div>

      <Button 
        className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition" 
        type="submit" 
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            {t("auth.creatingAccount")}
          </>
        ) : (
          t("auth.signUpButton")
        )}
      </Button>
    </form>
  );
}
