import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { Metadata } from "next";
import { generateCsrfToken } from "@/core/security/csrf";

export const metadata: Metadata = {
  title: "Admin Login - Tamer Studio",
  description: "Secure admin authentication portal",
};

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }> | { error?: string };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const csrfToken = generateCsrfToken();
  
  const cookieStore = await cookies();
  cookieStore.set("csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  const params = await Promise.resolve(searchParams);
  const error = params.error as "missing_fields" | "invalid_master_key" | "invalid_credentials" | "account_inactive" | "unexpected_error" | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AdminLoginForm error={error} csrfToken={csrfToken} />
    </div>
  );
}
