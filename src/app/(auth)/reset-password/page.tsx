"use client";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <h1 className="text-xl font-bold">← Back</h1>
            </Link>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
