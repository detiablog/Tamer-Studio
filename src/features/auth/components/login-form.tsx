"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth/auth-client";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { logger } from "@/core/logger";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LoginFormData extends LoginSchema {
  remember?: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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

  // Load remembered email on mount (not password!)
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

      // Save or clear remembered email (NEVER save password)
      if (values.remember) {
        localStorage.setItem("tamer.rememberEmail", values.email);
      } else {
        localStorage.removeItem("tamer.rememberEmail");
      }

      // Call sign in WITHOUT including callbackURL in parameters
      // This prevents email/password from appearing in URL
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      // Check for errors
      if (result.error) {
        const errorMessage = result.error.message || "Unable to sign in. Please check your credentials and try again.";
        logger.error("Login failed", new Error(errorMessage));
        toast.error(errorMessage);
        return;
      }

      // Success - redirect to dashboard
      toast.success("Signed in successfully");
      
      // Use replace instead of push to prevent back button returning to login
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace("/dashboard");
      
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Unexpected login error", err);
        toast.error(err.message || "Unable to sign in. Please try again later.");
      } else {
        logger.error("Unexpected login error", new Error(String(err)));
        toast.error("Unable to sign in. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to Tamer Studio</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              {...register("email")}
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={submitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
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
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-md p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={submitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-muted cursor-pointer"
                disabled={submitting}
              />
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
            size="lg"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
