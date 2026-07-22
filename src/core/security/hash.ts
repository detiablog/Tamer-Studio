import crypto from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, key) => {
      if (err) reject(err);
      else resolve(key.toString("hex"));
    });
  });
  return `${salt}:${await derivedKey}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, derivedKey] = storedHash.split(":");
  if (!salt || !derivedKey) return false;
  const testKey = new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, key) => {
      if (err) reject(err);
      else resolve(key.toString("hex"));
    });
  });
  return (await testKey) === derivedKey;
}
