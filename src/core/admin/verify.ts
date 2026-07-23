import { verifySecret } from "@/core/security/crypto";
import crypto from "crypto";

export async function verifyMasterKey(masterKey: string): Promise<boolean> {
  const expectedHash = process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) {
    return false;
  }

  if (expectedHash.startsWith("scrypt:")) {
    return verifySecret(masterKey, expectedHash);
  }

  if (/^[a-fA-F0-9]{64}$/.test(expectedHash)) {
    const actualHash = crypto.createHash("sha256").update(masterKey).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(actualHash, "utf8"), Buffer.from(expectedHash, "utf8"));
    } catch {
      return false;
    }
  }

  return false;
}
