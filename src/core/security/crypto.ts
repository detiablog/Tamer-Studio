import crypto from "crypto";

export function generateSecret(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function validateSecretFormat(secret: string, minLength = 32): boolean {
  return secret.length >= minLength && /^[a-zA-Z0-9]+$/.test(secret);
}
