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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterSchema) => {
    try {
      setSubmitting(true);
      const res = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      const maybeError = (res as unknown as { error?: { message?: string } }).error;
      if (maybeError) {
        toast.error(maybeError.message || "Unable to create account");
        return;
      }

      toast.success("Account created — redirecting...");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      toast.error(String(err ?? "Unexpected error"));
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
            <Label>Name</Label>
            <Input {...register("name")} placeholder="Your name" />
            {errors.name ? <p className="text-sm text-red-500">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="you@company.com" />
            {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" {...register("password")} placeholder="Create a password" />
            {errors.password ? <p className="text-sm text-red-500">{errors.password.message}</p> : null}
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
