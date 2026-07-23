"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 3000); // 3 second timeout

    // If already authenticated, redirect to dashboard immediately
    if (!isPending && session?.user) {
      clearTimeout(timer);
      router.replace("/dashboard");
      return;
    }

    // If not pending anymore, we're done checking
    if (!isPending) {
      clearTimeout(timer);
      setIsInitialized(true);
    }

    return () => clearTimeout(timer);
  }, [isPending, session, router]);

  // Show loading state while checking session (max 3 seconds)
  if (!isInitialized || isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Checking your session...</div>
      </main>
    );
  }

  // If authenticated, don't show login form
  if (session?.user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Tamer Studio</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
