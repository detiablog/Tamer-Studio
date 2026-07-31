"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { authClient } from "@/core/auth/client";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { logger } from "@/core/logger";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLocalizationContext } from "@/providers/localization";
import Link from "next/link";

interface LoginFormData extends LoginSchema {
  remember?: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const { t } = useLocalizationContext();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false,
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    const remembered = localStorage.getItem("tamer.rememberEmail");
    if (remembered) {
      setValue("email", remembered);
      setValue("remember", true);
    }
  }, [setValue]);

  const onSubmit = async (values: LoginFormData) => {
    try {
      setSubmitting(true);
      setUnverifiedEmail(null);

      if (values.remember) {
        localStorage.setItem("tamer.rememberEmail", values.email);
      } else {
        localStorage.removeItem("tamer.rememberEmail");
      }

      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        const errorMessage = result.error.message || t("auth.invalidCredentials");
        logger.error("Login failed", new Error(errorMessage));
        toast.error(errorMessage);
        return;
      }

      if (result.data?.user?.emailVerified === false) {
        await authClient.signOut();
        setUnverifiedEmail(values.email);
        toast.error(t("auth.emailNotVerified") || "Your email has not been verified yet");
        return;
      }

      toast.success(t("auth.signedIn"));

      await new Promise((resolve) => setTimeout(resolve, 100));
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Unexpected login error", err);
        toast.error(err.message || t("common.genericError"));
      } else {
        logger.error("Unexpected login error", new Error(String(err)));
        toast.error(t("common.genericError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">{t("auth.emailLabel")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.loginForm.emailPlaceholder")}
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold">{t("auth.passwordLabel")}</Label>
          <a
            href="/forgot-password"
            className="text-xs text-primary hover:text-primary/80 font-medium transition"
          >
            {t("common.forgotPassword")}
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.loginForm.passwordPlaceholder")}
            {...register("password")}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            disabled={submitting}
            className="h-10 bg-background/50 border-border focus:border-primary transition pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label={showPassword ? t("auth.loginForm.hidePassword") : t("auth.loginForm.showPassword")}
            disabled={submitting}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
        )}
      </div>

      {unverifiedEmail && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-2">
          <p className="text-sm text-destructive font-medium">
            {t("auth.emailNotVerified") || "Your email has not been verified yet"}
          </p>
          <Link
            href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className="text-sm text-primary hover:underline font-medium"
          >
            {t("auth.verifyEmail.resendButton") || "Resend Verification"}
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="remember"
          {...register("remember")}
          className="h-4 w-4 rounded border-border cursor-pointer transition accent-primary"
          disabled={submitting}
        />
        <label
          htmlFor="remember"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none font-medium"
        >
          {t("auth.rememberMe")}
        </label>
      </div>

      <Button
        className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition"
        type="submit"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <span className="inline-block animate-spin mr-2">&#8987;</span>
            {t("auth.signingIn")}
          </>
        ) : (
          t("auth.signInButton")
        )}
      </Button>
    </form>
  );
}
