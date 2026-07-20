"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) router.push("/dashboard" as unknown as Parameters<typeof router.push>[0]);
  }, [isPending, session, router]);

  return (
    <main>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-center">Create your account</h2>
        <p className="text-sm text-muted-foreground text-center mt-1">Start your journey with Tamer Studio</p>
      </div>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </main>
  );
}
