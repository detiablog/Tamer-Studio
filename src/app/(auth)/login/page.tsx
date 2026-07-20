"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) router.push("/dashboard" as unknown as Parameters<typeof router.push>[0]);
  }, [isPending, session, router]);

  return (
    <main>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-center">Welcome back</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">Sign in to your account to continue</p>
      </div>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-primary hover:underline">Create one</a>
      </p>
    </main>
  );
}
