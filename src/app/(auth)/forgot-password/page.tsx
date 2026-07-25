"use client";

import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { Mail, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Mail className="size-3.5" />
          Password Recovery
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Forgot your password?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Remember password?</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link 
          href="/login" 
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted hover:border-foreground/20 group"
        >
          Back to Sign In
          <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Need help?{" "}
        <Link href="/support" className="text-primary hover:underline font-medium">
          Contact support
        </Link>
      </p>
    </main>
  );
}
