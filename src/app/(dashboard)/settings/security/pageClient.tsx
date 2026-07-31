"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Copy,
  Download,
  Printer,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MonitorSmartphone,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TwoFactorStatus {
  enabled: boolean;
  lastVerified: string | null;
  recoveryCodesRemaining: number;
  trustedDevices: TrustedDevice[];
}

interface TrustedDevice {
  id: string;
  name: string;
  lastUsed: string;
  createdAt: string;
}

interface SetupData {
  qrCode: string;
  secret: string;
  recoveryCodes: string[];
}

export function SecuritySettingsPageClient() {
  const { t } = useLocalizationContext();

  const { data: statusData, isLoading: statusLoading, mutate: mutateStatus } = useSWR<TwoFactorStatus>(
    "/api/user/2fa/status",
    fetcher
  );

  const [setupData, setSetupData] = React.useState<SetupData | null>(null);
  const [verifyCode, setVerifyCode] = React.useState("");
  const [isSettingUp, setIsSettingUp] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isDisabling, setIsDisabling] = React.useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = React.useState(false);
  const [recoveryCodesSaved, setRecoveryCodesSaved] = React.useState(false);

  const [disablePassword, setDisablePassword] = React.useState("");
  const [disableCode, setDisableCode] = React.useState("");
  const [showDisableDialog, setShowDisableDialog] = React.useState(false);

  const [showRegenerateConfirm, setShowRegenerateConfirm] = React.useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = React.useState<string[]>([]);
  const [showNewRecoveryCodes, setShowNewRecoveryCodes] = React.useState(false);

  const [showSecret, setShowSecret] = React.useState(false);

  const twoFactorEnabled = statusData?.enabled ?? false;

  const handleEnable2FA = async () => {
    setIsSettingUp(true);
    try {
      const res = await fetch("/api/user/2fa/setup", { method: "POST" });
      if (!res.ok) throw new Error("Failed to start 2FA setup");
      const data = await res.json();
      setSetupData(data.data);
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verifyCode || verifyCode.length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode }),
      });
      if (!res.ok) throw new Error("Verification failed");
      toast.success(t("auth.twoFactor.verificationSuccess", "Two-factor authentication enabled successfully!"));
      if (setupData?.recoveryCodes) {
        setNewRecoveryCodes(setupData.recoveryCodes);
        setShowRecoveryCodes(true);
      }
      setVerifyCode("");
      await mutateStatus();
    } catch {
      toast.error(t("auth.twoFactor.verificationFailed", "Invalid code. Please try again."));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsDisabling(true);
    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword, code: disableCode }),
      });
      if (!res.ok) throw new Error("Failed to disable 2FA");
      toast.success(t("auth.twoFactor.disabled", "Disabled"));
      setShowDisableDialog(false);
      setDisablePassword("");
      setDisableCode("");
      await mutateStatus();
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setIsDisabling(false);
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    try {
      const res = await fetch("/api/user/2fa/recovery-codes", { method: "POST" });
      if (!res.ok) throw new Error("Failed to regenerate codes");
      const data = await res.json();
      setNewRecoveryCodes(data.data.codes);
      setShowNewRecoveryCodes(true);
      setShowRegenerateConfirm(false);
      await mutateStatus();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await fetch(`/api/user/2fa/devices/${deviceId}`, { method: "DELETE" });
      await mutateStatus();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRemoveAllDevices = async () => {
    try {
      await fetch("/api/user/2fa/devices", { method: "DELETE" });
      await mutateStatus();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const copySecret = async () => {
    if (setupData?.secret) {
      await copyToClipboard(setupData.secret);
      toast.success(t("auth.twoFactor.secretCopied", "Secret key copied to clipboard"));
    }
  };

  const copyAllCodes = async (codes: string[]) => {
    await copyToClipboard(codes.join("\n"));
    toast.success(t("auth.twoFactor.codesCopied", "Recovery codes copied to clipboard"));
  };

  const downloadCodes = (codes: string[]) => {
    const blob = new Blob([codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tamer-studio-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printCodes = (codes: string[]) => {
    const content = `Tamer Studio Recovery Codes\n\n${codes.join("\n")}\n\nKeep these codes in a safe place.`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre>${content}</pre>`);
      win.print();
      win.close();
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return t("auth.twoFactor.never", "Never");
    return new Date(date).toLocaleDateString();
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("auth.twoFactor.title", "Two-Factor Authentication")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.twoFactor.description", "Add an extra layer of security to your account")}
        </p>
      </div>

      <DashboardCard
        title={t("auth.twoFactor.title", "Two-Factor Authentication")}
        description={
          twoFactorEnabled
            ? t("auth.twoFactor.setupComplete", "Two-factor authentication is active")
            : t("auth.twoFactor.setupRequired", "Set up two-factor authentication to secure your account")
        }
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {twoFactorEnabled ? (
                <ShieldCheck className="size-5 text-green-500" />
              ) : (
                <ShieldOff className="size-5 text-muted-foreground" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t("auth.twoFactor.status", "Status")}</span>
                  <Badge tone={twoFactorEnabled ? "success" : "muted"}>
                    {twoFactorEnabled
                      ? t("auth.twoFactor.enabled", "Enabled")
                      : t("auth.twoFactor.disabled", "Disabled")}
                  </Badge>
                </div>
                {twoFactorEnabled && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("auth.twoFactor.lastVerified", "Last Verified")}:{" "}
                    {formatDate(statusData?.lastVerified ?? null)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {twoFactorEnabled ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowRegenerateConfirm(true)}>
                    <RefreshCw className="size-3.5" />
                    {t("auth.twoFactor.regenerateCodes", "Regenerate Recovery Codes")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setShowDisableDialog(true)}>
                    <ShieldOff className="size-3.5" />
                    {t("auth.twoFactor.disable", "Disable 2FA")}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEnable2FA} disabled={isSettingUp}>
                  {isSettingUp ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Shield className="size-3.5" />
                  )}
                  {t("auth.twoFactor.enable", "Enable 2FA")}
                </Button>
              )}
            </div>
          </div>

          {twoFactorEnabled && statusData && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">
                {statusData.recoveryCodesRemaining > 0
                  ? t("auth.twoFactor.recoveryCodesRemaining", "{count} recovery codes remaining").replace(
                      "{count}",
                      String(statusData.recoveryCodesRemaining)
                    )
                  : t("auth.twoFactor.noRecoveryCodes", "No recovery codes available")}
              </p>
            </div>
          )}

          {!twoFactorEnabled && setupData && !showRecoveryCodes && (
            <div className="space-y-6 rounded-lg border p-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t("auth.twoFactor.scanQrCode", "Scan QR Code with your authenticator app")}
                </h4>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {setupData.qrCode && (
                    <div className="rounded-lg border bg-white p-4">
                      <img
                        src={setupData.qrCode}
                        alt="QR Code"
                        className="size-48"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {t("auth.twoFactor.manualSetup", "Manual Setup")}
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-3 py-1.5 font-mono text-sm">
                          {showSecret ? setupData.secret : "\u2022".repeat(16)}
                        </code>
                        <Button variant="ghost" size="icon-sm" onClick={() => setShowSecret(!showSecret)}>
                          {showSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={copySecret}>
                          <Copy className="size-3.5" />
                          {t("auth.twoFactor.copySecret", "Copy Secret Key")}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("auth.twoFactor.enterCode", "Enter the 6-digit code from your authenticator app")}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={verifyCode}
                          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="w-32 font-mono"
                        />
                        <Button onClick={handleVerifyCode} disabled={isVerifying || verifyCode.length !== 6}>
                          {isVerifying ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          {isVerifying
                            ? t("auth.twoFactor.verifying", "Verifying...")
                            : t("auth.twoFactor.verifyCode", "Verify Code")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showRecoveryCodes && newRecoveryCodes.length > 0 && (
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-medium">{t("auth.twoFactor.recoveryCodes", "Recovery Codes")}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(
                      "auth.twoFactor.recoveryCodesDescription",
                      "Save these codes in a safe place. Each code can only be used once."
                    )}
                  </p>
                </div>
              </div>
              <div className="grid gap-1 rounded-lg bg-background p-3 font-mono text-sm sm:grid-cols-2">
                {newRecoveryCodes.map((code, i) => (
                  <div key={i} className="px-2 py-1">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyAllCodes(newRecoveryCodes)}>
                  <Copy className="size-3.5" />
                  {t("auth.twoFactor.copyAllCodes", "Copy All Codes")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadCodes(newRecoveryCodes)}>
                  <Download className="size-3.5" />
                  {t("auth.twoFactor.downloadCodes", "Download Codes")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => printCodes(newRecoveryCodes)}>
                  <Printer className="size-3.5" />
                  {t("auth.twoFactor.printCodes", "Print Codes")}
                </Button>
              </div>
              {!recoveryCodesSaved ? (
                <Button onClick={() => { setRecoveryCodesSaved(true); setShowRecoveryCodes(false); }}>
                  <CheckCircle2 className="size-3.5" />
                  {t("auth.twoFactor.savedCodes", "I've saved my recovery codes")}
                </Button>
              ) : null}
            </div>
          )}

          {showNewRecoveryCodes && !showRecoveryCodes && newRecoveryCodes.length > 0 && (
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-medium">{t("auth.twoFactor.recoveryCodes", "Recovery Codes")}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(
                      "auth.twoFactor.recoveryCodesDescription",
                      "Save these codes in a safe place. Each code can only be used once."
                    )}
                  </p>
                </div>
              </div>
              <div className="grid gap-1 rounded-lg bg-background p-3 font-mono text-sm sm:grid-cols-2">
                {newRecoveryCodes.map((code, i) => (
                  <div key={i} className="px-2 py-1">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyAllCodes(newRecoveryCodes)}>
                  <Copy className="size-3.5" />
                  {t("auth.twoFactor.copyAllCodes", "Copy All Codes")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadCodes(newRecoveryCodes)}>
                  <Download className="size-3.5" />
                  {t("auth.twoFactor.downloadCodes", "Download Codes")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => printCodes(newRecoveryCodes)}>
                  <Printer className="size-3.5" />
                  {t("auth.twoFactor.printCodes", "Print Codes")}
                </Button>
                <Button onClick={() => setShowNewRecoveryCodes(false)}>
                  <CheckCircle2 className="size-3.5" />
                  {t("auth.twoFactor.savedCodes", "I've saved my recovery codes")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DashboardCard>

      {twoFactorEnabled && (
        <DashboardCard
          title={t("auth.twoFactor.trustedDevices", "Trusted Devices")}
          description={t(
            "auth.twoFactor.trustedDevicesDescription",
            "Devices that don't require 2FA on login"
          )}
        >
          <div className="space-y-4">
            {statusData?.trustedDevices && statusData.trustedDevices.length > 0 ? (
              <>
                <div className="space-y-2">
                  {statusData.trustedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <MonitorSmartphone className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{device.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("auth.twoFactor.lastSecurityEvent", "Last security event")}:{" "}
                            {formatDate(device.lastUsed)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        <Trash2 className="size-3.5" />
                        {t("auth.twoFactor.removeDevice", "Remove")}
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="destructive" size="sm" onClick={handleRemoveAllDevices}>
                  <Trash2 className="size-3.5" />
                  {t("auth.twoFactor.removeAllDevices", "Remove All")}
                </Button>
              </>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {t("auth.twoFactor.noTrustedDevices", "No trusted devices")}
              </p>
            )}
          </div>
        </DashboardCard>
      )}

      {showDisableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{t("auth.twoFactor.disable", "Disable 2FA")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "auth.twoFactor.disableConfirm",
                "Disable 2FA? You will need to re-enter your authenticator code and password."
              )}
            </p>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{t("auth.twoFactor.passwordRequired", "Enter your password to confirm")}</Label>
                <Input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("auth.twoFactor.codeRequired", "Enter your current authenticator code")}</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDisableDialog(false); setDisablePassword(""); setDisableCode(""); }}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={isDisabling || !disablePassword || disableCode.length !== 6}
              >
                {isDisabling && <Loader2 className="size-3.5 animate-spin" />}
                {t("auth.twoFactor.disable", "Disable 2FA")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{t("auth.twoFactor.regenerateCodes", "Regenerate Recovery Codes")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "auth.twoFactor.regenerateConfirm",
                "This will invalidate all previous recovery codes. Are you sure?"
              )}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRegenerateConfirm(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleRegenerateRecoveryCodes}>
                <RefreshCw className="size-3.5" />
                {t("auth.twoFactor.regenerateCodes", "Regenerate Recovery Codes")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
