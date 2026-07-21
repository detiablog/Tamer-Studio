import { randomUUID } from "crypto";

export function generateCsrfToken(): string {
  return randomUUID();
}

export function validateCsrfToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0;
}
