"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowLeft, ShieldAlert, Crown, UserCheck, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/core/logger";
import { useLocalizationContext } from "@/providers/localization";

type AdminLoginMode = "founder" | "admin";

type AdminLoginError = "missing_fields" | "invalid_master_key" | "invalid_credentials" | "account_inactive" | "unexpected_error" | "rate_limited";

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
  rate_limited: "Too many attempts. Please try again later.",
};

export function AdminLoginForm({ error, csrfToken }: AdminLoginFormProps) {
  const router = useRouter();
  const { t } = useLocalizationContext();
  const [mode, setMode] = React.useState<AdminLoginMode>("admin");
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(error ? t(`admin.login.errors.${error}`, ERROR_MESSAGES[error]) : null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showMasterKey, setShowMasterKey] = React.useState(false);
  const [emailValue, setEmailValue] = React.useState("");
  const [passwordValue, setPasswordValue] = React.useState("");
  const [masterKeyValue, setMasterKeyValue] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const masterKeyRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (mode === "admin") {
      emailRef.current?.focus();
    } else {
      masterKeyRef.current?.focus();
    }
  }, [mode]);

  const handleModeChange = React.useCallback((newMode: AdminLoginMode) => {
    setMode(newMode);
    setFormError(null);
    setMasterKeyValue("");
    setShowMasterKey(false);
  }, []);

  const validateForm = React.useCallback((): string | null => {
    if (!emailValue.trim()) {
      return t("admin.login.errors.missing_fields", ERROR_MESSAGES.missing_fields);
    }
    if (!emailValue.includes("@")) {
      return t("admin.loginForm.invalidEmail", "Please enter a valid email address.");
    }
    if (!passwordValue) {
      return t("admin.login.errors.missing_fields", ERROR_MESSAGES.missing_fields);
    }
    if (mode === "founder" && !masterKeyValue) {
      return t("admin.login.errors.missing_fields", ERROR_MESSAGES.missing_fields);
    }
    return null;
  }, [emailValue, passwordValue, masterKeyValue, mode, t]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      setSubmitting(false);
      return;
    }

    try {
      const body: Record<string, string> = {
        email: emailValue.trim(),
        password: passwordValue,
      };
      if (mode === "founder") {
        body.adminKey = masterKeyValue;
      }

      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const result = (await response.json()) as AdminLoginApiResponse;

      if (!result.success) {
        const reason = result.reason ?? "unexpected_error";
        const errorMsg = t(`admin.login.errors.${reason}`, ERROR_MESSAGES[reason]);
        setFormError(errorMsg);
        logger.error("Admin login failed", new Error(errorMsg));
        toast.error(errorMsg);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      toast.success(t("admin.loginForm.toastSuccess", "Admin portal accessed successfully"));

      await new Promise(resolve => setTimeout(resolve, 300));
      router.replace("/admin");
      await new Promise(resolve => setTimeout(resolve, 500));
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Admin login error", err);
        setFormError(err.message || t("admin.login.errors.unexpected_error", ERROR_MESSAGES.unexpected_error));
      } else {
        logger.error("Admin login error", new Error(String(err)));
        setFormError(t("admin.login.errors.unexpected_error", ERROR_MESSAGES.unexpected_error));
      }
      toast.error(t("admin.login.errors.unexpected_error", ERROR_MESSAGES.unexpected_error));
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6 text-center" role="status" aria-live="polite">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">{t("admin.loginForm.successTitle", "Access Granted")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("admin.loginForm.successMessage", "Redirecting to the admin portal...")}
          </p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold text-destructive">
          <ShieldAlert className="size-3.5" />
          {t("admin.loginForm.badge", "Admin Access Only")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {t("admin.loginForm.title", "Admin Portal")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("admin.loginForm.description", "Sign in to access the admin dashboard and manage your platform.")}
        </p>
      </div>

      <div role="radiogroup" aria-label={t("admin.login.modeLabel", "Login mode")} className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-1">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "admin"}
          onClick={() => handleModeChange("admin")}
          className={`
            flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            ${mode === "admin"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
        >
          <UserCheck className="size-4" />
          {t("admin.login.modeAdmin", "Admin")}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "founder"}
          onClick={() => handleModeChange("founder")}
          className={`
            flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            ${mode === "founder"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
        >
          <Crown className="size-4" />
          {t("admin.login.modeFounder", "Founder")}
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {mode === "founder" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <label htmlFor="adminKey" className="text-sm font-semibold">
              {t("admin.loginForm.masterKeyLabel", "Admin Key")}
              <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
              <input
                ref={masterKeyRef}
                id="adminKey"
                name="adminKey"
                type={showMasterKey ? "text" : "password"}
                required
                value={masterKeyValue}
                onChange={(e) => setMasterKeyValue(e.target.value)}
                placeholder={t("admin.loginForm.masterKeyPlaceholder", "Enter admin key")}
                autoComplete="off"
                disabled={submitting}
                aria-required="true"
                className="w-full h-10 rounded-lg border border-border bg-background/50 pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowMasterKey((v) => !v)}
                disabled={submitting}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
                aria-label={showMasterKey ? t("admin.loginForm.hideKey", "Hide key") : t("admin.loginForm.showKey", "Show key")}
                tabIndex={-1}
              >
                {showMasterKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              <Lock className="inline size-3 mr-1" aria-hidden="true" />
              {t("admin.loginForm.securelyStored", "Your credentials are encrypted and securely stored.")}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">
            {t("admin.loginForm.emailLabel", "Email Address")}
            <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            required
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            placeholder={t("admin.loginForm.emailPlaceholder", "admin@example.com")}
            autoComplete="email"
            disabled={submitting}
            aria-required="true"
            aria-describedby={formError ? "login-error" : undefined}
            className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            {t("admin.loginForm.passwordLabel", "Password")}
            <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder={t("admin.loginForm.passwordPlaceholder", "Enter your password")}
              autoComplete="current-password"
              disabled={submitting}
              aria-required="true"
              className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
              aria-label={showPassword ? t("admin.loginForm.hidePassword", "Hide password") : t("admin.loginForm.showPassword", "Show password")}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={submitting}
              className="size-4 rounded border-border accent-primary"
              aria-label={t("admin.loginForm.rememberMe", "Remember me")}
            />
            <span className="text-sm text-muted-foreground">{t("admin.loginForm.rememberMe", "Remember me")}</span>
          </label>
        </div>

        {formError && (
          <div
            id="login-error"
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="size-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div>{formError}</div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-3 py-2 text-sm font-semibold text-primary-foreground hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("admin.loginForm.authenticating", "Authenticating...")}
            </span>
          ) : (
            mode === "founder" ? t("admin.loginForm.submitFounder", "Sign In as Founder") : t("admin.loginForm.submitButton", "Sign In")
          )}
        </button>
      </form>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {t("admin.loginForm.restrictedAccess", "Restricted access — authorized personnel only")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="size-3" aria-hidden="true" />
          {t("admin.login.backToHome", "Back to Home")}
        </Link>
      </div>
    </div>
  );
}
