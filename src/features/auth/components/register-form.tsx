"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { logger } from "@/core/logger";
import { PasswordStrengthMeter } from "@/features/auth/components/password-strength-meter";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocalizationContext } from "@/providers/localization";

export function RegisterForm() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: undefined as unknown as true,
    },
  });

  const password = watch("password");

  const onSubmit = async (values: RegisterSchema) => {
    try {
      setSubmitting(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage = data?.error?.message || data?.message || t("common.genericError");
        logger.error("Registration failed", new Error(errorMessage));
        toast.error(errorMessage);
        return;
      }

      toast.success(t("auth.accountCreated"));
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
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
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">{t("auth.nameLabel")}</Label>
        <Input
          id="name"
          type="text"
          placeholder={t("auth.registerForm.namePlaceholder")}
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

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">{t("auth.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.registerForm.emailPlaceholder")}
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

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold">{t("auth.passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.registerForm.passwordPlaceholder")}
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
            aria-label={showPassword ? t("auth.registerForm.hidePassword") : t("auth.registerForm.showPassword")}
            disabled={submitting}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
        )}
        <PasswordStrengthMeter password={password || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold">{t("auth.registerForm.confirmPasswordLabel") || "Confirm Password"}</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("auth.registerForm.confirmPasswordPlaceholder") || "Confirm your password"}
            {...register("confirmPassword")}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            disabled={submitting}
            className="h-10 bg-background/50 border-border focus:border-primary transition pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showConfirmPassword ? t("auth.registerForm.hidePassword") : t("auth.registerForm.showPassword")}
            disabled={submitting}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="termsAccepted"
            {...register("termsAccepted")}
            className="mt-0.5 h-4 w-4 rounded border-border cursor-pointer transition accent-primary"
            disabled={submitting}
          />
          <label
            htmlFor="termsAccepted"
            className="text-sm text-muted-foreground leading-tight cursor-pointer select-none"
          >
            {t("auth.registerForm.agreeToTerms") || "I agree to the"}{" "}
            <Link href="/legal/terms" className="text-primary hover:underline font-medium" target="_blank">
              {t("auth.termsOfService") || "Terms of Service"}
            </Link>
            {" "}{t("auth.registerForm.and") || "and"}{" "}
            <Link href="/legal/privacy" className="text-primary hover:underline font-medium" target="_blank">
              {t("auth.privacyPolicy") || "Privacy Policy"}
            </Link>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-xs text-destructive font-medium">{errors.termsAccepted.message}</p>
        )}
      </div>

      <Button
        className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition"
        type="submit"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className="inline-block animate-spin mr-2">&#8987;</span>
            {t("auth.creatingAccount")}
          </>
        ) : (
          t("auth.signUpButton")
        )}
      </Button>
    </form>
  );
}
