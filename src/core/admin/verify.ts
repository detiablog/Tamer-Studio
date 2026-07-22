import { hashSecret, safeCompare } from "@/core/security/crypto";

export function verifyMasterKey(masterKey: string): boolean {
  const expectedHash = process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) {
    return false;
  }
  const actualHash = hashSecret(masterKey);
  return safeCompare(actualHash, expectedHash);
}
