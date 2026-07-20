"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema & { remember?: boolean }>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginSchema & { remember?: boolean }) => {
    try {
      setSubmitting(true);
      // Persist remembered email locally for UX (not required for auth server)
      if (values.remember) {
        localStorage.setItem("tamer.rememberEmail", values.email);
      } else {
        localStorage.removeItem("tamer.rememberEmail");
      }

      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      // The Better Auth client may return an object shaped like { error } or { session }
      // Handle common cases conservatively
      const maybeError = (result as unknown as { error?: { message?: string } }).error;
      if (maybeError) {
        toast.error(maybeError.message || "Failed to sign in");
        return;
      }

      toast.success("Signed in");

      // Redirect to dashboard after successful sign in
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      toast.error(String(err ?? "An unexpected error occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    const remembered = localStorage.getItem("tamer.rememberEmail");
    if (remembered) {
      // pre-fill email field when remembered
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
            <Label>Email</Label>
            <Input type="email" placeholder="you@company.com" {...register("email")} name="email" />
            {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" placeholder="Your password" {...register("password")} />
            {errors.password ? <p className="text-sm text-red-500">{errors.password.message}</p> : null}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("remember")} className="rounded border-muted p-1" />
              <span className="text-sm">Remember me</span>
            </label>
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
