import { verifySecret } from "@/core/security/crypto";

export async function verifyMasterKey(masterKey: string): Promise<boolean> {
  const expectedHash = process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) {
    return false;
  }
  return verifySecret(masterKey, expectedHash);
}
