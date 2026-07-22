"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const adminKey = String(formData.get("adminKey") || "");

    if (!email || !password || !adminKey) {
      setFormError(ERROR_MESSAGES.missing_fields);
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
        body: JSON.stringify({ email, password, adminKey }),
      });

      const result = await response.json() as AdminLoginApiResponse;

      if (!result.success) {
        const reason = result.reason ?? "unexpected_error";
        setFormError(ERROR_MESSAGES[reason]);
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setFormError(ERROR_MESSAGES.unexpected_error);
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
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="admin@tamer.studio"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="adminKey" className="text-sm font-medium">Admin Key</label>
          <input
            id="adminKey"
            name="adminKey"
            type="password"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Master key"
          />
          <p className="text-xs text-muted-foreground">This key is stored securely in the server environment.</p>
        </div>

        {formError && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in as Admin"}
        </button>
      </form>
    </div>
  );
}
