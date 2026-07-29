"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/core/logger";
import { useLocalizationContext } from "@/providers/localization";

type AdminLoginError = "missing_fields" | "invalid_master_key" | "invalid_credentials" | "account_inactive" | "unexpected_error";

type AdminLoginFormProps = {
  error?: AdminLoginError;
  csrfToken: string;
};

type AdminLoginApiResponse = {
  success: boolean;
  reason?: AdminLoginError;
  session?: {
    id: string;
    token: string;
    adminId: string;
    expiresAt: string;
    createdAt: string;
  };
};

const ERROR_MESSAGES: Record<AdminLoginError, string> = {
  missing_fields: "Please fill in all fields.",
  invalid_master_key: "Invalid admin key. Access denied.",
  invalid_credentials: "Invalid email or password.",
  account_inactive: "Your admin account is inactive.",
  unexpected_error: "An unexpected error occurred. Please try again.",
};

export function AdminLoginForm({ error, csrfToken }: AdminLoginFormProps) {
  const router = useRouter();
  const { t } = useLocalizationContext();
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(error ? t(`admin.error.${error}`, ERROR_MESSAGES[error]) : null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showAdminKey, setShowAdminKey] = React.useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const adminKey = String(formData.get("adminKey") || "");

    if (!email || !password || !adminKey) {
      setFormError(t("admin.error.missingFields", ERROR_MESSAGES.missing_fields));
      setSubmitting(false);
      return;
    }

    if (!email.includes("@")) {
      setFormError(t("admin.error.invalidEmail", "Please enter a valid email address."));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, password, adminKey }),
      });

      const result = (await response.json()) as AdminLoginApiResponse;

      if (!result.success) {
        const reason = result.reason ?? "unexpected_error";
        const errorMsg = t(`admin.error.${reason}`, ERROR_MESSAGES[reason]);
        setFormError(errorMsg);
        logger.error("Admin login failed", new Error(errorMsg));
        toast.error(errorMsg);
        setSubmitting(false);
        return;
      }

      
      toast.success(t("admin.loginForm.toastSuccess", "Admin portal accessed successfully"));
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      router.replace("/admin");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      router.refresh();
      
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Admin login error", err);
        setFormError(err.message || t("admin.error.unexpectedError", ERROR_MESSAGES.unexpected_error));
      } else {
        logger.error("Admin login error", new Error(String(err)));
        setFormError(t("admin.error.unexpectedError", ERROR_MESSAGES.unexpected_error));
      }
      toast.error(t("admin.error.unexpectedError", ERROR_MESSAGES.unexpected_error));
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold text-destructive">
          <ShieldAlert className="size-3.5" />
          {t("admin.loginForm.badge")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("admin.loginForm.title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("admin.loginForm.description")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">
            {t("admin.loginForm.emailLabel")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder={t("admin.loginForm.emailPlaceholder")}
            autoComplete="email"
            disabled={submitting}
            className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            {t("admin.loginForm.passwordLabel")}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder={t("admin.loginForm.passwordPlaceholder")}
              autoComplete="current-password"
              disabled={submitting}
              className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
              aria-label={showPassword ? t("admin.loginForm.hidePassword", "Hide password") : t("admin.loginForm.showPassword", "Show password")}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Admin Key Field */}
        <div className="space-y-2">
          <label htmlFor="adminKey" className="text-sm font-semibold">
            {t("admin.loginForm.masterKeyLabel")}
          </label>
          <div className="relative">
            <input
              id="adminKey"
              name="adminKey"
              type={showAdminKey ? "text" : "password"}
              required
              placeholder={t("admin.loginForm.masterKeyPlaceholder")}
              disabled={submitting}
              className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowAdminKey((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
              aria-label={showAdminKey ? t("admin.loginForm.hideKey", "Hide key") : t("admin.loginForm.showKey", "Show key")}
            >
              {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            <Lock className="inline size-3 mr-1" />
            {t("admin.loginForm.securelyStored")}
          </p>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
            <div className="flex items-start gap-2">
              <ShieldAlert className="size-4 mt-0.5 flex-shrink-0" />
              <div>{formError}</div>
            </div>
          </div>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-3 py-2 text-sm font-semibold text-primary-foreground hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all duration-200 group"
        >
          {submitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              {t("admin.loginForm.authenticating")}
            </>
          ) : (
            t("admin.loginForm.submitButton")
          )}
        </button>
      </form>

      {/* Footer with back link */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {t("admin.loginForm.restrictedAccess")}
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="size-3" />
          {t("admin.login.backToHome")}
        </Link>
      </div>
    </div>
  );
}
