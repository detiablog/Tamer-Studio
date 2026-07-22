import { randomUUID } from "crypto";
import { safeCompare } from "./crypto";

export function generateCsrfToken(): string {
  return randomUUID();
}

export function validateCsrfToken(token: string, storedToken: string): boolean {
  return safeCompare(token, storedToken) && token.length > 0;
}
