"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, ArrowRight, Lock } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 3000);

    if (!isPending && session?.user) {
      clearTimeout(timer);
      router.replace("/dashboard");
      return;
    }

    if (!isPending) {
      clearTimeout(timer);
      setIsInitialized(true);
    }

    return () => clearTimeout(timer);
  }, [isPending, session, router]);

  if (!isInitialized || isPending) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin">
          <Lock className="size-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Checking your session...</p>
      </main>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <LogIn className="size-3.5" />
          Sign In
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sign in to access your workspace and continue creating amazing content.
        </p>
      </div>

      <LoginForm />

      <div className="space-y-4 pt-2">
        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">New to Tamer?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link 
          href="/register" 
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted hover:border-foreground/20 group"
        >
          Create an account
          <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        Having trouble signing in?{" "}
        <Link href="/support" className="text-primary hover:underline font-medium">
          Contact support
        </Link>
      </p>
    </main>
  );
}
