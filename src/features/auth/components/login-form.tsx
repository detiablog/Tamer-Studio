"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { hasAuthError } from "@/features/auth/types";
import { logger } from "@/core/logger";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema & { remember?: boolean }>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginSchema & { remember?: boolean }) => {
    try {
      setSubmitting(true);
      if (values.remember) {
        localStorage.setItem("tamer.rememberEmail", values.email);
      } else {
        localStorage.removeItem("tamer.rememberEmail");
      }

      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });

      if (hasAuthError(result) && result.error?.message) {
        const err = new Error(result.error.message);
        err.name = "BetterAuthError";
        logger.error("Login failed", err);
        toast.error(result.error.message || "Unable to sign in. Please check your credentials and try again.");
        return;
      }

      if (hasAuthError(result)) {
        const err = new Error(result.error?.message ?? "Unknown auth error");
        err.name = "BetterAuthError";
        logger.error("Login failed with unknown auth error", err);
        toast.error(result.error?.message || "Unable to sign in. Please try again later.");
        return;
      }

      toast.success("Signed in");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Unexpected login error", err);
      } else {
        logger.error("Unexpected login error", new Error(String(err)));
      }
      toast.error("Unable to sign in. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    const remembered = localStorage.getItem("tamer.rememberEmail");
    if (remembered) {
      const el = document.querySelector<HTMLInputElement>('input[name="email"]');
      if (el) el.value = remembered;
    }
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to Tamer Studio</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register("email")}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                {...register("password")}
                autoComplete="current-password"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("remember")} className="rounded border-muted" />
              <span className="text-sm">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</a>
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
