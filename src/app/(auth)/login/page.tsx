"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = (authClient as unknown as { useSession?: () => { data: unknown; isPending: boolean } }).useSession?.() ?? { data: null, isPending: false };

  useEffect(() => {
    if (!isPending && session) router.push("/dashboard");
  }, [isPending, session]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
