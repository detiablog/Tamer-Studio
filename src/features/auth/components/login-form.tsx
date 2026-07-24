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
import { useLocalizationContext } from "@/providers/localization";

interface LoginFormData extends LoginSchema {
  remember?: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const { t } = useLocalizationContext();
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

      toast.success(t("auth.signedIn"));
      
      await new Promise(resolve => setTimeout(resolve, 100));
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("auth.signInTitle")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.emailLabel")}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordLabel")}
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-muted cursor-pointer"
                disabled={submitting}
              />
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("auth.rememberMe")}
              </span>
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline transition-colors"
            >
              {t("common.forgotPassword")}
            </a>
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
            size="lg"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                {t("auth.signingIn")}
              </>
            ) : (
              t("auth.signInButton")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
