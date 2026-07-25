"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/core/logger";

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
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(error ? ERROR_MESSAGES[error] : null);
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

    console.log("[AdminLoginForm] Submitting with:", { email, passwordLength: password.length, adminKeyLength: adminKey.length });

    if (!email || !password || !adminKey) {
      setFormError(ERROR_MESSAGES.missing_fields);
      setSubmitting(false);
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }

    try {
      console.log("[AdminLoginForm] Calling /api/admin/auth/login...");
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, password, adminKey }),
      });

      console.log("[AdminLoginForm] Response status:", response.status);
      const result = (await response.json()) as AdminLoginApiResponse;
      console.log("[AdminLoginForm] Response body:", result);

      if (!result.success) {
        const reason = result.reason ?? "unexpected_error";
        const errorMsg = ERROR_MESSAGES[reason];
        setFormError(errorMsg);
        logger.error("Admin login failed", new Error(errorMsg));
        toast.error(errorMsg);
        setSubmitting(false);
        return;
      }

      console.log("[AdminLoginForm] Login successful!");
      
      if (result.session?.token) {
        try {
          localStorage.setItem("admin_session_token", result.session.token);
          console.log("[AdminLoginForm] Stored admin_session_token in localStorage");
          
          document.cookie = `admin_session=${result.session.token}; path=/; max-age=${60*60*24}`;
          console.log("[AdminLoginForm] Manually set admin_session cookie via document.cookie");
        } catch (storageErr) {
          console.error("[AdminLoginForm] Failed to store:", storageErr);
        }
      }
      
      toast.success("Admin portal accessed successfully");
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("[AdminLoginForm] About to redirect to /admin");
      router.replace("/admin");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      router.refresh();
      
    } catch (err) {
      console.error("[AdminLoginForm] Catch error:", err);
      if (err instanceof Error) {
        logger.error("Admin login error", err);
        setFormError(err.message || ERROR_MESSAGES.unexpected_error);
      } else {
        logger.error("Admin login error", new Error(String(err)));
        setFormError(ERROR_MESSAGES.unexpected_error);
      }
      toast.error(ERROR_MESSAGES.unexpected_error);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold text-destructive">
          <ShieldAlert className="size-3.5" />
          Admin Portal
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Secure Admin Access
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter your admin credentials and master key to access the administrative panel.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">
            Admin Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="admin@tamer.studio"
            autoComplete="email"
            disabled={submitting}
            className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={submitting}
              className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Admin Key Field */}
        <div className="space-y-2">
          <label htmlFor="adminKey" className="text-sm font-semibold">
            Master Admin Key
          </label>
          <div className="relative">
            <input
              id="adminKey"
              name="adminKey"
              type={showAdminKey ? "text" : "password"}
              required
              placeholder="••••••••••••••••"
              disabled={submitting}
              className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowAdminKey((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 p-1"
              aria-label={showAdminKey ? "Hide key" : "Show key"}
            >
              {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            <Lock className="inline size-3 mr-1" />
            Stored securely in server environment
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
              Authenticating...
            </>
          ) : (
            "Access Admin Panel"
          )}
        </button>
      </form>

      {/* Footer with back link */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Restricted access
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="size-3" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
