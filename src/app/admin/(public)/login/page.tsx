import Link from "next/link";
import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - Tamer Studio",
  description: "Secure admin authentication portal",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const cookieStore = await cookies();
  const csrfToken = cookieStore.get("csrf_token")?.value ?? "";

  const params = await searchParams;
  const error = params.error as "missing_fields" | "invalid_master_key" | "invalid_credentials" | "account_inactive" | "unexpected_error" | undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-destructive/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-destructive/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-2 transition hover:opacity-80"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <span className="text-xs font-bold">TS</span>
              </div>
              <span className="hidden sm:inline text-sm font-semibold">Tamer Studio</span>
            </Link>
            <div className="w-12" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-24">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Admin card with security indicator */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-xl ring-1 ring-destructive/10">
            <AdminLoginForm error={error} csrfToken={csrfToken} />
          </div>

          {/* Security notice */}
          <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-200 text-center">
            ⚠️ This is a restricted access area. Unauthorized access attempts are logged.
          </div>
        </div>
      </div>
    </div>
  );
}
