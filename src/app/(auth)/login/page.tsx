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
    <main className="flex min-h-screen items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
