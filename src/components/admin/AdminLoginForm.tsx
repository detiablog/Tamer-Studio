"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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

    // Validate on client
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
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        // CRITICAL: Do NOT include password/email in URL - use request body only
        body: JSON.stringify({ email, password, adminKey }),
      });

      const result = (await response.json()) as AdminLoginApiResponse;

      if (!result.success) {
        const reason = result.reason ?? "unexpected_error";
        const errorMsg = ERROR_MESSAGES[reason];
        setFormError(errorMsg);
        logger.error("Admin login failed", new Error(errorMsg));
        toast.error(errorMsg);
        setSubmitting(false);
        return;
      }

      // Success
      toast.success("Admin signed in successfully");
      
      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use replace instead of push to prevent back button
      router.replace("/admin");
      
      // Also refresh to ensure server validates session
      await new Promise(resolve => setTimeout(resolve, 500));
      router.refresh();
      
    } catch (err) {
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
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="text-sm text-muted-foreground">Enter your admin credentials and master key</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="admin@tamer.studio"
            autoComplete="email"
            disabled={submitting}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Admin Key Field */}
        <div className="space-y-2">
          <label htmlFor="adminKey" className="text-sm font-medium">
            Admin Key
          </label>
          <div className="relative">
            <input
              id="adminKey"
              name="adminKey"
              type={showAdminKey ? "text" : "password"}
              required
              placeholder="Master key"
              disabled={submitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowAdminKey((v) => !v)}
              disabled={submitting}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              aria-label={showAdminKey ? "Hide key" : "Show key"}
            >
              {showAdminKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            This key is stored securely in the server environment.
          </p>
        </div>

        {/* Error Message */}
        {formError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Signing in...
            </>
          ) : (
            "Sign in as Admin"
          )}
        </button>
      </form>
    </div>
  );
}
