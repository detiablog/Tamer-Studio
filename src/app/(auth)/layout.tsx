import * as React from "react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="font-heading text-lg font-bold">TS</span>
          </div>
          <h1 className="font-heading text-xl font-semibold">Tamer Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI-first production platform</p>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by reCAPTCHA. Subject to the{" "}
          <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          {" "}and{" "}
          <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
