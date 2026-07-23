"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logger } from "@/core/logger";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setSubmitting(true);

      // Call API to send password reset email
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      setSubmittedEmail(values.email);
      setSubmitted(true);
      toast.success("Check your email for reset instructions");
      reset();
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Forgot password error", error);
        toast.error(error.message || "Unable to send reset email");
      } else {
        logger.error("Forgot password error", new Error(String(error)));
        toast.error("Unable to send reset email. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>Password reset link sent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p>
              We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>
            </p>
            <p className="mt-2">
              Check your email and click the link to reset your password. The link expires in 1 hour.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Try another email
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
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

          <Button
            className="w-full"
            type="submit"
            disabled={submitting}
            size="lg"
          >
            {submitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Remember your password?</span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
