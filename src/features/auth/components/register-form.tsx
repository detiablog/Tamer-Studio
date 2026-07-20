"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterSchema) => {
    try {
      setSubmitting(true);
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      const maybeError = (result as unknown as { error?: { message?: string } }).error;
      if (maybeError) {
        toast.error(maybeError.message || "Failed to create account");
        return;
      }

      toast.success("Account created");
      router.push("/dashboard" as unknown as Parameters<typeof router.push>[0]);
    } catch (err: unknown) {
      console.error(err);
      toast.error(String(err ?? "An unexpected error occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="John Doe" {...register("name")} autoComplete="name" aria-invalid={!!errors.name} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} autoComplete="email" aria-invalid={!!errors.email} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                {...register("password")}
                autoComplete="new-password"
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

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
