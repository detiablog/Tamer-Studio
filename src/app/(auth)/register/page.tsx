"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { RegisterForm } from "@/features/auth/components/register-form";

// Landing-page specific translations (isolated from global translations)
const LANDING_PAGE_TRANSLATIONS = {
  getStartedButton: "Get Started Free",
  signInButton: "Sign In",
} as const;

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) router.push("/dashboard" as unknown as Parameters<typeof router.push>[0]);
  }, [isPending, session, router]);

  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" />
          New Account
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Join thousands of creators building with Tamer Studio. Start your journey to streamlined production.
        </p>
      </div>

      <RegisterForm />

      <div className="space-y-4 pt-2">
        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Already have an account?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link 
          href="/login" 
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted hover:border-foreground/20 group"
        >
          {LANDING_PAGE_TRANSLATIONS.signInButton}
          <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground leading-relaxed">
        By signing up, you agree to our{" "}
        <Link href="/legal/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>
        {" "}and{" "}
        <Link href="/legal/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>.
      </p>
    </main>
  );
}
