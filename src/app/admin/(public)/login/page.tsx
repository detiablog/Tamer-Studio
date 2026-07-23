import { cookies } from "next/headers";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login - Tamer Studio",
  description: "Secure admin authentication portal",
};

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }> | { error?: string };
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const cookieStore = await cookies();
  const csrfToken = cookieStore.get("csrf_token")?.value ?? "";

  const params = await Promise.resolve(searchParams);
  const error = params.error as "missing_fields" | "invalid_master_key" | "invalid_credentials" | "account_inactive" | "unexpected_error" | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AdminLoginForm error={error} csrfToken={csrfToken} />
    </div>
  );
}
