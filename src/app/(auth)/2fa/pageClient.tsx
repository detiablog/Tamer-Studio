"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalizationContext } from "@/providers/localization";

export function TwoFactorClient() {
  const router = useRouter();
  const { t } = useLocalizationContext();
  const [code, setCode] = React.useState("");
  const [useRecovery, setUseRecovery] = React.useState(false);
  const [rememberDevice, setRememberDevice] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const codeLength = useRecovery ? 10 : 6;
  const pattern = useRecovery ? /^[A-Za-z0-9-]+$/ : /^\d*$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (pattern.test(value) && value.length <= codeLength) {
      setCode(value);
      setError(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (pattern.test(pasted) && pasted.length <= codeLength) {
      setCode(pasted);
      setError(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== codeLength) {
      setError(t("auth.2fa.invalidLength", `Code must be ${codeLength} characters`));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/2fa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: getCookie("better-auth.session_token"),
          code,
          rememberDevice,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || t("auth.2fa.invalidCode", "Invalid code. Please try again."));
        return;
      }

      toast.success(t("auth.2fa.verified", "Verification successful"));
      router.replace("/dashboard");
    } catch {
      setError(t("auth.2fa.networkError", "A network error occurred. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="two-factor-code" className="text-sm font-semibold">
          {useRecovery
            ? t("auth.2fa.recoveryCodeLabel", "Recovery Code")
            : t("auth.2fa.codeLabel", "Verification Code")}
        </Label>
        <Input
          id="two-factor-code"
          type="text"
          value={code}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={useRecovery ? "XXXX-XXXX-XXXX" : "000000"}
          autoComplete="one-time-code"
          disabled={submitting}
          autoFocus
          className={`h-10 bg-background/50 border-border focus:border-primary transition ${
            useRecovery ? "font-mono text-sm tracking-wider" : "text-center text-lg tracking-[0.5em] font-mono"
          }`}
          maxLength={codeLength}
          aria-invalid={!!error}
        />
        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="use-recovery"
          checked={useRecovery}
          onCheckedChange={(checked) => {
            setUseRecovery(checked === true);
            setCode("");
            setError(null);
          }}
          disabled={submitting}
        />
        <label
          htmlFor="use-recovery"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none font-medium"
        >
          {t("auth.2fa.useRecoveryCode", "Use a recovery code")}
        </label>
      </div>

      {!useRecovery && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-device"
            checked={rememberDevice}
            onCheckedChange={(checked) => setRememberDevice(checked === true)}
            disabled={submitting}
          />
          <label
            htmlFor="remember-device"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none font-medium"
          >
            {t("auth.2fa.rememberDevice", "Remember this device for 30 days")}
          </label>
        </div>
      )}

      <Button
        className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition"
        type="submit"
        disabled={submitting || code.length !== codeLength}
      >
        {submitting ? (
          <>
            <span className="inline-block animate-spin mr-2">&#8987;</span>
            {t("auth.2fa.verifying", "Verifying...")}
          </>
        ) : (
          t("auth.2fa.verifyButton", "Verify")
        )}
      </Button>
    </form>
  );
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : undefined;
}
