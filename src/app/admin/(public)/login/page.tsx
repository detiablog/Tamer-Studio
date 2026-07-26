import Link from "next/link";
import { cookies } from "next/headers";
import { clearAdminSessionCookie } from "@/core/admin/session";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { LoginPageClientContent } from "./_components/LoginPageClient";

export const metadata = {
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
    <LoginPageClientContent csrfToken={csrfToken} error={error} />
  );
}
