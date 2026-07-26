"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TokenValidator({ onValid }: { onValid: (token: string) => void }) {
  const { t } = useLocalizationContext();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`, {
          method: "GET",
        });

        const data = await res.json().catch(() => ({} as { valid?: boolean }));

        if (res.ok && data.valid === true) {
          setStatus("valid");
          onValid(token);
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    };

    validate();
  }, [token, onValid]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
        </CardContent>
      </Card>
    );
  }

  if (!token || status === "invalid") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.resetPasswordForm.invalidLink.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("auth.resetPasswordForm.invalidLink.description")}
          </p>
          <Link href="/forgot-password" className="text-primary hover:underline">
            {t("auth.resetPasswordForm.invalidLink.requestNew")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function TokenValidatorSuspense({ onValid }: { onValid: (token: string) => void }) {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    }>
      <TokenValidator onValid={onValid} />
    </Suspense>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLocalizationContext();
  const [validToken, setValidToken] = useState<string | null>(null);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <h1 className="text-xl font-bold">{t("auth.resetPassword.back")}</h1>
            </Link>
          </div>
          {!validToken ? (
            <TokenValidatorSuspense onValid={setValidToken} />
          ) : (
            <ResetPasswordForm token={validToken} />
          )}
        </div>
      </div>
    </main>
  );
}
