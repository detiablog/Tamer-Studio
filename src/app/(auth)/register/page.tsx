"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) router.push("/dashboard");
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <RegisterForm />
    </main>
  );
}
