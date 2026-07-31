import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";
import { encrypt, decrypt } from "@/modules/email/email.encryption";
import { db } from "@/lib/db";
import { securityEvent } from "@/lib/db/schema/auth";

const TOTP_ISSUER = "Tamer Studio";
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const TOTP_ALGORITHM = "SHA1";

export function generateId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

export function generateTotpSecret(): { secret: string; encryptedSecret: string } {
  const totp = new TOTP({
    issuer: TOTP_ISSUER,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: new Secret({ size: 20 }),
  });

  const plainSecret = totp.secret.base32;
  const encryptedSecret = encrypt(plainSecret);

  return { secret: plainSecret, encryptedSecret };
}

export function verifyTotpCode(encryptedSecret: string, code: string): boolean {
  try {
    const plainSecret = decrypt(encryptedSecret);

    const totp = new TOTP({
      issuer: TOTP_ISSUER,
      algorithm: TOTP_ALGORITHM,
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD,
      secret: Secret.fromBase32(plainSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

export async function generateQrDataUrl(encryptedSecret: string, email: string): Promise<string> {
  const plainSecret = decrypt(encryptedSecret);

  const totp = new TOTP({
    issuer: TOTP_ISSUER,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: Secret.fromBase32(plainSecret),
    label: email,
  });

  const uri = totp.toString();
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export function generateRecoveryCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = crypto.randomBytes(10);
    const code = bytes.toString("hex").toUpperCase().replace(/(.{4})/g, "$1-").slice(0, 19);
    codes.push(code);
  }
  return codes;
}

export function hashRecoveryCode(code: string): string {
  return crypto.createHash("sha256").update(code.toLowerCase().trim()).digest("hex");
}

export async function createSecurityEvent(
  userId: string,
  eventType: string,
  description?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(securityEvent).values({
    id: generateId("se"),
    userId,
    eventType,
    description: description || null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    metadata: metadata || {},
  });
}
