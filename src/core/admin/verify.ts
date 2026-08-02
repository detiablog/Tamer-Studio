import { verifySecret } from "@/core/security/crypto";
import { logger } from "@/core/logger";
import { config } from "@/core/config";
import crypto from "crypto";

/**
 * Verify admin master key
 * Supports: SHA256 hash OR scrypt hash
 * Plain text comparison is deprecated for security.
 */
export async function verifyMasterKey(masterKey: string): Promise<boolean> {
  const expectedHash = config.admin.masterKeyHash || process.env.ADMIN_MASTER_KEY_HASH;
  if (!expectedHash) {
    return false;
  }

  // 1. Try scrypt format
  if (expectedHash.startsWith("scrypt:")) {
    return verifySecret(masterKey, expectedHash);
  }

  // 2. Try SHA256 format
  if (/^[a-fA-F0-9]{64}$/.test(expectedHash)) {
    // Direct hash comparison: user might send the hash itself
    if (masterKey === expectedHash) {
      logger.debug("Admin key verified via direct hash match");
      return true;
    }

    // Or user might send the original key — hash it and compare
    const actualHash = crypto.createHash("sha256").update(masterKey).digest("hex");
    try {
      if (crypto.timingSafeEqual(Buffer.from(actualHash, "utf8"), Buffer.from(expectedHash, "utf8"))) {
        logger.debug("Admin key verified via hash comparison");
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}
